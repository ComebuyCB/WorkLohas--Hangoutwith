setWH()
window.onresize = function(){
  setWH()
}

$(function(){
  customModal()
  customEye()
})

function setWH(){
  document.documentElement.style.setProperty('--wh', window.innerHeight + 'px' )
}


/*=== plugin settings ===*/
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


/*=== Common Js ===*/
  /**
   * 是否為行動裝置?
   * return {boolean}
   */
  function isTouchDevice() {
      return (('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0) ||
          (navigator.msMaxTouchPoints > 0))
  }


  /**
   * 移除不正確的裝置
   * <div js-device="pc"> 手機版將被移除
   * <div js-device="mobile"> 電腦版將被移除
   */
  function detectDevice_RemoveAnother(){
      if ( isTouchDevice() ){
          $('[js-device=pc]').remove()
      } else {
          $('[js-device=mobile]').remove()
      }
  }


  /**
   * 生日 - 三個連動的下拉式選單
   * <select id="??"> * 3
   */
  function select_birth( yearId, monthId, dateId ){
    let yearStart = new Date().getFullYear() - 120

    // 年 ( yearStart ~ 今年 )
    for (let i = new Date().getFullYear(); i >= yearStart; i--) {
      $(yearId).append(`<option value="${i}">${i}</option>`)
    }

    // 月 ( 1 ~ 12 )
    for (let i = 1; i <= 12; i++) {
      $(monthId).append(`<option value="${i}">${i}</option>`)
    }
    
    toChangeDate()
    $(yearId).change(toChangeDate)
    $(monthId).change(toChangeDate)

    // 年、月選單改變時
    function toChangeDate() {
      if ( $(yearId).val() != -1 && $(monthId).val() != -1 ) {
        let lastDate = new Date( $(yearId).val(), $(monthId).val(), 0).getDate()

        // 移除超過此月份的天數
        $(dateId).children('option').each( function() {
          if ( $(this).val() != -1 && $(this).val() > lastDate){
            $(this).remove()
          }
        })

        // 加入此月份的天數
        for (let i = 1; i <= lastDate; i++) {
          if ( !$(dateId).children(`option[value=${i}]`).length ) {
            $(dateId).append(`<option value="${i}">${i}</option>`)
          }
        }
      } else {
        $(dateId).children('option:selected').removeAttr('selected')
      }
    }
  }

 /**
   * alert 有樣式的modal
   */
  function _alert( content='', btn='', fn=function(){} ){
    $('#modal-alert').find('.js-alert-content').html( content )
    $('#modal-alert').find('.js-alert-close-btn').text(`${btn = btn ? btn : '關閉'}`)
    $('#modal-alert').one('hide.bs.modal', function() { fn() })
    $('#modal-alert').modal('show')
  }


  function customModal(){
    $('body').on('show.bs.modal', '.modal-page', function (e) {
      let classList = Object.values( $(this)[0].classList )
      let backdrop = classList.find( item => item.indexOf('modal-page') > -1 )
      if ( backdrop !== undefined ){
        $( function() {
          if ( $('.modal-backdrop').eq(1).length> 0 ){
            $('.modal-backdrop').eq(1).addClass('modal-page-backdrop')
          } else {
            $('.modal-backdrop').eq(0).addClass('modal-page-backdrop')
          }
        })
      }
    })
  
    $('body').on('show.bs.modal', '.modal-bot', function (e) {
      $('body').css('overflow','hidden')
    })
  
    $('body').on('hidden.bs.modal', '.modal-bot', function (e) {
      $('body').css('overflow','')
    })
  }


  function customEye(){
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
  }