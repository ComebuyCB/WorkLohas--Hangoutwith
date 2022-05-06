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


  class _CompressImage{
    constructor(inputId,layoutId,args){
        let def = {
            inputId: inputId, // *<input type="file" id="(inputId)">
            layoutId: layoutId, // *渲染圖片的地方
            maxImg: 30, // 圖片最多幾張
            validType: '', // 圖片副檔名限制
            compress: true, // 是否壓縮圖片
            maxWidth: 1200, // 壓縮最大寬
            maxHeight: 1200, // 壓縮最大高
            quality: 1, // 壓縮品質
            render: ``,
            
            // 以下為class內部使用
            trigger: null,  // 觸發的物件
            img_idxId: 0, // 上傳了第幾張編號圖片(目的: 若刪除之前的圖片，會從最後圖的號碼繼續++，如system number概念)
            multiple: false, // <input> 是否為多張
        }
        Object.assign(def,args)
        Object.assign(this,def)
        this.listeners()
    }

    listeners(){
        let This = this
        $('#'+this.inputId).off('click').on('click', function(){ // 按下加入圖片，刷新既有的input file，以免點到相同的圖片無法觸發onchange
            this.value = "";
        })
        $('#'+this.inputId).off('change').on('change', function(){
            This.trigger = this
            if ( This.validImg(this) == true ){
                $('body').append(`<div id="compressImg-backdrop" style="background: rgba(255,255,255,0.5); position: fixed; left: 0; top: 0; bottom: 0; right: 0; display: flex; align-items: center; justify-content: center; z-index: 10">
                    圖片上傳中，請稍後... ( <span id="compressImg-nowNum">1</span> / <span id="compressImg-total">1</span> )
                </div>`)
                This.multiple = $(this).prop('multiple')
                This.readImg( This.trigger )
            }
        });
    }

    validImg(self){
        let This = this
        if (self.files && self.files[0]) {
            for (let i=0; i < self.files.length; i++ ){
                if (!self.files[i].type.match('image\/')){ // 驗證圖片
                    alert('檔案格式錯誤')
                    return false
                }
                let vT = new RegExp('image\/('+This.validType+')')
                if (!self.files[i].type.match(vT)){ // 驗證圖片格式
                    alert('圖片格式需為: '+This.validType)
                    return false
                }
            }
            if ( This.maxImg && self.files.length + $('#'+This.layoutId + '> *').length > This.maxImg ){ // 驗證圖片數量
                alert('圖片不得大於'+This.maxImg+'張')
                return false
            }
        }
        return true
    }

    readImg(self) {
        let This = this
        $('#compressImg-total').text( self.files.length )
        if (self.files && self.files[0]) {
            let fileIdx = 0
            for (let i=0; i < self.files.length; i++ ){
                if ( This.multiple ){
                    $('#'+This.layoutId).append( This.render )
                } else {
                    $('#'+This.layoutId).html( This.render )
                }
                let reader = new FileReader()
                reader.onload = function(){
                    This.compressImg( this.result, self.files[i].type, function( base64, idx, blob ){
                        $('#'+This.layoutId).find('.js-compressImg').eq(0)
                            .removeClass('js-compressImg')
                            .css('background-image',`url(${blob||base64})`)
                            .attr('data-fancybox',This.layoutId)
                            .attr('href',base64)
                            .html(`<textarea hidden name="${This.inputId}[]">${base64}</textarea>`)
                        
                        $('#compressImg-nowNum').text( idx + 2 )
                        if ( self.files.length === idx + 1 ){
                            $('#compressImg-backdrop').remove()
                        }
                    }, fileIdx )
                    fileIdx ++
                }
                reader.readAsDataURL(self.files[i]);
            }
            // console.log( self.files )
        } else {
            $('#compressImg-backdrop').remove()
        }
    }

    compressImg( inputUrl, imgType, callback, img_index ){
        let This = this
        let img = new Image()
        img.src = inputUrl
        img.onload = function(){
            if ( This.compress === true ){
                // 預設按比例壓縮
                let w = this.width
                let h = this.height

                if ( w > This.maxWidth ){
                    let scale = w / This.maxWidth
                    w = This.maxWidth
                    h = h / scale
                }
                if ( h > This.maxHeight ){
                    let scale = h / This.maxHeight
                    h = This.maxHeight
                    w = w / scale
                }
    
                // 生成canvas
                let canvas = document.createElement('canvas')
                let ctx = canvas.getContext('2d')
                canvas.width = w
                canvas.height = h
                ctx.drawImage(this, 0, 0, w, h)
    
                let base64 = canvas.toDataURL( imgType ? imgType : 'image/jpeg', This.quality )
                canvas.toBlob( blob => { 
                  let blobUrl = URL.createObjectURL(blob)
                  callback( base64, img_index, blobUrl ) // 回撥函式返回base64的值
                })
            } else {
                callback( inputUrl, img_index )
            }
        }
    }
  }