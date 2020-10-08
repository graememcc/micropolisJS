$(document).ready(function(){
  $("#fieldFormContainer").on("change", "#WWTPSelect input[name^='WWTP_']", function(event) {
    if ($(this).val() == "1") {
      $(this).parent().find('.FieldInd').css({
        'visibility': 'hidden',
        'display': 'none'
      });
      $(this).parent().find('.FieldWWTP').css({
        'visibility': 'visible',
        'display': 'block'
      });
    } else {
      $(this).parent().find('.FieldInd').css({
        'visibility': 'visible',
        'display': 'inline-block',
      });
    }
  });
});