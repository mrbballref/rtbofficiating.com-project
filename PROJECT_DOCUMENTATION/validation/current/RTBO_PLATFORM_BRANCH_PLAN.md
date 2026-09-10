# RTBO PLATFORM BUILD BRANCH PLAN — CURRENT

Each standalone HTML/CSS/JS platform is developed and validated in an isolated branch derived from the current validation-governance branch. This prevents one platform's source/evidence from silently changing another platform's validation history.

## Standalone HTML/CSS/JS branches

- `chatgpt/01-rtbo-core-complete-build`
- `chatgpt/02-got-u-nex-ref-complete-build`
- `chatgpt/03-refzone-university-complete-build`
- `chatgpt/04-live-stream-complete-build`
- `chatgpt/05-jammed-up-bar-complete-build`
- `chatgpt/06-locker-room-complete-build`
- `chatgpt/07-vault-complete-build`
- `chatgpt/08-refshop-complete-build`
- `chatgpt/09-cutting-room-complete-build`
- `chatgpt/10-lab-hub-complete-build`
- `chatgpt/11-master-cms-super-admin-complete-build`

## Enterprise branches created only after prerequisites pass

- integrated HTML/CSS/JS enterprise branch: after all 11 standalone HTML/CSS/JS platforms lock;
- full-stack architecture branch: after integrated HTML/CSS/JS enterprise locks;
- individual full-stack platform/module branches: after exact architecture/versions freeze;
- integrated full-stack enterprise branch: after every full-stack platform/module locks.

## Teaching

No platform branch becoming locked changes the project-wide teaching freeze. Teaching remains prohibited until the complete project reaches `PROJECT_WIDE_LOCKED`.
