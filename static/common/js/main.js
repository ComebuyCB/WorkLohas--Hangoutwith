setWH()
window.onresize = function(){
  setWH()
}

$(function(){
  htmlRepeat()
})


function setWH(){
  document.documentElement.style.setProperty('--wh', window.innerHeight + 'px' )
}

/*=== Common Js ===*/
  /**
   * 找url的參數值
   * @param {(string|string[]|{})} param 可填寫: name / [name...] / '' / {}
   * @param {string} url =window.location.href
   * @return {(string|string[]|{})} 回傳值
   */
  function getUrlParam( param, url ){
    let vUrl = url || window.location.href
    let queryString = vUrl.replace(/.*\?/g,'').replace(/#.*/g,'')
    const urlSearchParams = new URLSearchParams(queryString)
    
    // 文字
    if ( param && typeof param === 'string' ){
      return urlSearchParams.get(param)
    }

    // 陣列
    if ( param && Array.isArray(param) ){
      return param.map( r => urlSearchParams.get(r) )
    }

    // 空值 || "" || {}
    if ( typeof param === 'undefined' || param === '' || ( typeof param === 'object' && Object.keys(param).length == 0 ) ){
      console.log( Object.fromEntries(urlSearchParams.entries()) )
      return Object.fromEntries(urlSearchParams.entries())
    }
    
    return null
  }
  /* 範例: */
  // console.log( '單個: return 字串', getUrlParam('type') )
  // console.log( '多個: return 陣列', getUrlParam(['type','length']) )
  // console.log( '空值: return 物件', getUrlParam(), getUrlParam(''), getUrlParam({}) )
  // console.log( '第二參數指定連結:', getUrlParam('type', 'www.abc.com?type=123') )



  /**
   * 1. js-popTarget 指定目標打開，按其他處關閉目標
   * 2. js-popTargetMode 可設成 'toggle'
   * EX: <button js-popTarget="#menu" js-popTargetMode="toggle">Menu</button>
   *     <nav id="menu"> 目標內容... </nav>
   */
  class PopupTargets {
    constructor(){
      this.targets = []
      if ( $('[js-popTarget]').length > 0 ){
        this.showTarget()
        this.filterTarget()
        this.hideTarget()
      }
    }

    showTarget(){
      // 設置 js-popTarget 的目標，click 後打開目標
      let _this = this
      $('[js-popTarget]').each( function(){
        let target = $(this).attr('js-popTarget')
        _this.targets.push( target )
        $(this).on('click',function(){
          if ( $(this).attr('js-popTargetMode') === 'toggle' ){
            $(target).toggle()
          } else {
            $(target).show()
          }
        })
      })
    }

    // 篩選重複
    filterTarget(){
      this.targets.filter( (elem, index, arr)=>{
        return arr.indexOf(elem) === index
      })
    }

    // 按下其他地方時，隱藏目標
    hideTarget(){
      $.each( this.targets, function( index, elem ){
        $(document).click(function(e) {
          let targetName = $(e.target).attr('js-popTarget') ? 
            $(e.target).attr('js-popTarget') : 
            $(e.target).closest('[js-popTarget]').attr('js-popTarget')

          /* 隱藏目標條件：
            1. [按下處html] 是 [目標html] 
            2. [按下處html] 是 [目標html] 的裡面
            3. [按下處是開關，開關的目標名字] 等於 [目標名字]
            4. [按下處的父類是開關，開關的目標名字] 等於 [目標名字]
            以上皆非，則關閉目標。
          */
          if ( !$(elem).is(e.target) && $(elem).has(e.target).length === 0 && !$(elem).is( $(targetName) ) ) {
            $(elem).hide()
          }
        })
      })
    }
  }

  /**
   * 複製該html N次
   */
  function htmlRepeat(){
    $.each( $('[js-html-repeat]'), function(idx,ele){
      let repeat = $(ele).attr('js-html-repeat')
      $(ele).removeAttr('js-html-repeat')
      
      let tpl = $(ele)[0].outerHTML
      let str = `<!-- js-html-repeat="${repeat}"-->`
      for ( let i=0; i<+repeat; i++){
        str += tpl
      }
      $(ele)[0].outerHTML = str
    })
  }


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


$('.modal-page').on('show.bs.modal', function(){
  $('.modal-backdrop').remove()
})


$( function () {
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

})