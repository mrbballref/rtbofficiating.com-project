THE JAMMED UP BAR! — LOCAL PREVIEW

Open the root index.html file to begin.

All internal navigation links now point directly to each page's index.html file
(e.g. listen/index.html rather than listen/). This prevents local servers that
show directory indexes from displaying an "Index of ..." page when a navigation
item is clicked.

An Apache .htaccess file is also included to set DirectoryIndex index.html and
disable directory listings where .htaccess overrides are supported.
