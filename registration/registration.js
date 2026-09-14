import { supabase } from '../assets/auth.js';

(() => {
  "use strict";

  // Kept only as a local "my receipts" cache after a successful server-side
  // submission — the real record of truth is public.program_registrations.
  const STORE_KEY = "rtbo.trainingSchoolRegistrations.v1";
  const validSchools = ["uapb-men","uapb-women","uca-women","ualr-women"];

  const hub = document.querySelector("[data-registration-hub]");
  if (hub) {
    const params = new URLSearchParams(location.search);
    const school = params.get("school");
    if (validSchools.includes(school)) {
      location.replace(`${school}.html`);
      return;
    }
  }

  const form = document.querySelector("#school-registration-form");
  if (!form) return;

  const dateInput = document.querySelector('input[name="schoolDate"]');
  if (dateInput) {
    const now = new Date();
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,10);
    dateInput.min = localISO;
  }

  const phone = form.elements.phone;
  if (phone) {
    phone.addEventListener("input", () => {
      const digits = phone.value.replace(/\D/g, "").slice(0,10);
      if (digits.length <= 3) phone.value = digits;
      else if (digits.length <= 6) phone.value = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      else phone.value = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    });
  }

  const goals = form.elements.goals;
  const counter = document.querySelector("[data-goals-counter]");
  const updateCounter = () => {
    if (counter && goals) counter.textContent = `${goals.value.length} / 1000`;
  };
  goals?.addEventListener("input", updateCounter);
  updateCounter();

  // Signature canvas
  const canvas = document.querySelector("[data-signature-canvas]");
  const signatureData = document.querySelector("[data-signature-data]");
  const clearButton = document.querySelector("[data-clear-signature]");
  let hasSignature = false;
  let drawing = false;
  let ctx = null;

  const configureCanvas = () => {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const saved = hasSignature ? canvas.toDataURL("image/png") : null;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#f2f2ef";
    if (saved) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = saved;
    }
  };

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {x:event.clientX - rect.left, y:event.clientY - rect.top};
  };

  canvas?.addEventListener("pointerdown", (event) => {
    drawing = true;
    hasSignature = true;
    canvas.setPointerCapture?.(event.pointerId);
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x,p.y);
  });
  canvas?.addEventListener("pointermove", (event) => {
    if (!drawing) return;
    const p = point(event);
    ctx.lineTo(p.x,p.y);
    ctx.stroke();
  });
  const stopDrawing = () => {
    if (!drawing) return;
    drawing = false;
    if (signatureData && hasSignature) signatureData.value = canvas.toDataURL("image/png");
  };
  canvas?.addEventListener("pointerup", stopDrawing);
  canvas?.addEventListener("pointercancel", stopDrawing);
  canvas?.addEventListener("pointerleave", stopDrawing);

  clearButton?.addEventListener("click", () => {
    if (!canvas || !ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    hasSignature = false;
    if (signatureData) signatureData.value = "";
  });

  if (canvas) {
    requestAnimationFrame(configureCanvas);
    window.addEventListener("resize", configureCanvas);
  }

  const saveReceiptLocally = (record) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      const records = Array.isArray(parsed) ? parsed : [];
      records.push(record);
      localStorage.setItem(STORE_KEY, JSON.stringify(records));
    } catch {
      /* best-effort local receipt cache only; server submission already succeeded */
    }
  };

  const status = document.querySelector("[data-registration-status]");
  const submitButton = form.querySelector('[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status?.classList.remove("is-error");

    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) {
        status.textContent = "Please complete all required fields.";
        status.classList.add("is-error");
      }
      return;
    }

    if (!hasSignature || !signatureData?.value) {
      if (status) {
        status.textContent = "Please add the official’s signature before submitting.";
        status.classList.add("is-error");
      }
      canvas?.focus();
      return;
    }

    const data = new FormData(form);
    const schoolSlug = data.get("schoolSlug");
    const experienceLevel = [data.get("yearsOfficiating"), data.get("highestLevel")]
      .filter(Boolean).join(" — ");
    const notes = [
      `Preferred session date: ${data.get("schoolDate") || "not specified"}`,
      `Address: ${data.get("address1") || ""} ${data.get("address2") || ""}, ${data.get("city") || ""}, ${data.get("state") || ""} ${data.get("zip") || ""}`.trim(),
      data.get("gender") ? `Gender: ${data.get("gender")}` : null,
      data.get("goals") ? `Goals: ${data.get("goals")}` : null,
      data.get("recommendedBy") ? `Recommended by: ${data.get("recommendedBy")}` : null,
      `Waiver accepted: ${data.get("waiverAccepted") === "on" ? "yes" : "no"} (signed by ${data.get("printedName") || "n/a"})`,
    ].filter(Boolean).join("\n");

    if (submitButton) submitButton.disabled = true;
    if (status) status.textContent = "Submitting your registration…";

    try {
      const { data: program, error: programError } = await supabase.rpc("public_get_program", {
        program_slug: schoolSlug,
      });
      if (programError || !program) {
        throw new Error("This training school could not be found. Please contact RTBO for assistance.");
      }
      if (program.registration_open === false) {
        throw new Error("Registration for this training school is not currently open.");
      }

      const { data: result, error: registerError } = await supabase.rpc("public_register_for_program", {
        target_program_id: program.id,
        attendee_first_name: data.get("firstName"),
        attendee_last_name: data.get("lastName"),
        attendee_email: data.get("email"),
        attendee_phone: data.get("phone"),
        attendee_organization: data.get("schoolName") || "",
        attendee_role: "Official",
        attendee_experience_level: experienceLevel,
        attendee_notes: notes,
      });
      if (registerError) throw registerError;

      saveReceiptLocally({
        confirmationCode: result.confirmation_code,
        submittedAt: new Date().toISOString(),
        status: result.status,
        schoolSlug,
        schoolName: data.get("schoolName"),
        schoolProgram: data.get("schoolProgram"),
        firstName: data.get("firstName"),
        lastName: data.get("lastName"),
        email: data.get("email"),
      });

      if (status) {
        status.classList.remove("is-error");
        status.textContent = result.status === "waitlisted"
          ? `You're on the waitlist. Confirmation: ${result.confirmation_code}`
          : `Registration submitted successfully. Confirmation: ${result.confirmation_code}`;
      }

      form.reset();
      hasSignature = false;
      if (signatureData) signatureData.value = "";
      if (ctx && canvas) ctx.clearRect(0,0,canvas.width,canvas.height);
      updateCounter();
      window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
    } catch (error) {
      if (status) {
        status.textContent = error?.message?.includes("already registered")
          ? "This email address is already registered for this training school."
          : (error?.message || "The registration could not be submitted. Please try again.");
        status.classList.add("is-error");
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
})();
