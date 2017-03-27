// Начинать писать отсюда!!!!
$( "div.foo" ).toggleClass(function() {
  if ( $( this ).parent().is( ".bar" ) ) {
    return "happy";
  } else {
    return "sad";
  });
