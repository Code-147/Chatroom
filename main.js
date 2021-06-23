$(document).ready(() => {

  $('body')
    .on("click", "#blurmask", function () {
      if ($("#wechat")) {
        $("#wechat").remove()
      }
      $("#blurmask").fadeOut(200)
      setTimeout(() => {
        $("#blurmask").remove()
      }, 200)
    })

    // 新标签页打开图片
    .on("click", "img", function () {
      window.open(this.src)
    })

  // $(window)
  //   .on("resize", function () {
  //     
  //   })
})