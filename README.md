# Rephlex Editor
This is a Google Apps Script code editor that connects directly to your Google drive for loading and saving files. It creates
unique query strings for each file, allowing files to be saved and opened as bookmarks.

This tool uses the CodeMirror library for the actual editor portion, providing the syntax highlighting and editing functions of the editor. I've 
created a custom search plugin for CodeMirror to make the search UI more user friendly. 

This is very much a WYSIWYG editor. It currently provides syntax highlighting support for:
- HTML
- CSS
- JS
- XML

This is all done through the CodeMirror library and many other languages can be added. Check out their documentation for more info. 
Similarly, there are tons of other themes to choose from. I only use dark mode themes.

To deploy:

- Create a new Google Apps Script Project (script.google.com)
- Create each corresponding file in your Apps Script Project
- Deploy the project as a web app

Enjoy!
