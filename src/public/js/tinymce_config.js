tinymce.init({
    selector: 'textarea#description',
    license_key: 'gpl',
    plugins: 'lists link image table code help wordcount',
    content_css: 'tinymce-5-dark',
    skin: 'oxide-dark',
    highlight_on_focus: false,
    setup: function (editor) {
      editor.on('init', function () {
        document.getElementById('loader-small').style.display = 'none';
        tinymce.get("description").setContent("");
    });
  }
});