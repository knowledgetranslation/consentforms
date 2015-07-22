$(document).ready(function() {
  $("#shortTitle, #subTitle, #institution").keyup(function(e) {
    if ($(this).val().length > 0) {
      $("#slug").val(getSlug());
    }
  });
});

function getSlug() {
  return convertToSlug($("#shortTitle").val()) + "-" + convertToSlug($("#subTitle").val()) + "-" + convertToSlug($("#institution").val());
}

function convertToSlug(text) {
  return text
    .split("'")
    .join("")
    .toLowerCase()
    .replace(/[^\w ]+/g,'')
    .replace(/ +/g,'-')
    ;
}