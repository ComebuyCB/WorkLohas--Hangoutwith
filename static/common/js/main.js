set100vh()
function set100vh(){
  function setIt(){
    document.documentElement.style.setProperty('--100vh', window.innerHeight + 'px' )
  }
  setIt()
  window.onresize = function(){
    setIt()
  }
}

SVGInject.setOptions({
  onFail: function(img, svg) {
    img.classList.remove('js-svg')
  },
  afterInject: function(img, svg){
    $.each( $(svg).find('[fill]'), function(idx,ele){
      let fill = $(ele).attr('fill')
      if ( fill !== 'none' || fill !== 'currentColor' ){
        $(ele).attr('fill', 'currentColor')
      }
    })
    $.each( $(svg).find('[stroke]'), function(idx,ele){
      let stroke = $(ele).attr('stroke')
      if ( stroke !== 'none' || stroke !== 'currentColor' ){
        $(ele).attr('stroke', 'currentColor')
      }
    })
  },
})


$(document).on('click','.js-eye',function(){
  let $input = $(this).closest('.js-input-eye').find('input')
  let $eye = $(this).closest('.js-input-eye').find('.js-eye')
  let inputType = $input.attr('type')
  switch(inputType){
    case 'password':
      $eye.addClass('open')
      $input.attr('type','text')
    break
    case 'text':
      $eye.removeClass('open')
      $input.attr('type','password')
    break
    default:
    break
  }
})