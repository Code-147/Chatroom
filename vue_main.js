// From 4.21
// Update 6.20

const App = Vue.createApp({
	data() {
		return {
			// info
			info: "17班聊天室",

			user_ID: "Error", // ID
			user_POS: "Error", // 权限

			inputMsg: "",
			tip_name: "",
			sendSVGColor: "rgba(180 180 180 / 0.4)",
			sendButtonColor: "",

			isShowForm: false,
			placeholder: "在这里输入 :)",

			// 右击菜单相关
			menu_obj: "",
			menu_status: "off",
			menu_x: "0",
			menu_y: "0",

			// 消息
			logs_Cont: [{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This asd dasdhashd asdhashda shdhas dh ahsd hasd ahsd hasd hasdh ash dhasdhashdh asdh ashd hasd hashd hsadh hsd ahsdh ashdhashdhasdh asdhashdhasdh ashd had  vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"},{"uuid":"01010101010101010101","text":"This is a vue-msg","name":"","date":"mm/dd ww hh:mm"}], // 格式:[{"uuid":"","text":"","name":"","date":"mm/dd ww hh:mm"}]

			// 成员
			st_List: [],
		}
	},



	watch: {
		// input时筛选姓名
		inputMsg(text) {
			if (text) {
				var name = this.picktext(text)
				if (name) {
					this.tip_name = this.picktext(name)
				} else {
					this.tip_name = ""
				}

				this.sendSVGColor = "#64DD17"
			} else {
				this.sendSVGColor = "rgba(180 180 180 / 0.4)"
			}
		},
	},

	computed: {
		textORimg() {
			return this.isShowForm ? "文本" : "图片"
		},
	},

	created() {
		// this.check_wechat()
		this.getinfo()
		this.isadmin()

		// 获取消息列表
		// this.longpolling()
	},



	methods: {
		// 检索数组并刷新DOM
		refreshDOM(result) {
			const logs = this.logs_Cont
			const that = this
			if (logs.length < result.length && logs.length != 0) {
				for (var index in logs) {
			  	if (logs[index].id != result[index].id) {
						that.logs_Cont = result // 全部更新
						that.longpolling()
						that.scrolltobottom()
						return null // 直接结束方法运行
					}
				}
				// 插入新消息
				let arr = result.slice(logs.length - result.length)
				that.logs_Cont.push.apply(that.logs_Cont, arr)
				that.scrolltobottom()
		  } else {
				that.logs_Cont = result // 全部更新
				that.scrolltobottom()
		  }
			setTimeout(() => {
				that.longpolling()
			}, 2000)
		},

		// 微信浏览器检测（暂时弃用）
		check_wechat() {
			if (navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger") {
				$("body").append(`<div id="blurmask"><div id="wechat">为保证正常使用：<br>请点击右上角的 <b>"..."</b><br>选择在<b>"浏览器中打开"</b></div></div>`)
				$("#blurmask").fadeIn(400)
			}
		},

		// 4.14 获取UUID途径
		getUUID() {
			var temp_url = URL.createObjectURL(new Blob())
			var uuid = temp_url.toString()
			URL.revokeObjectURL(temp_url)
			const uuid_Out = uuid.substr(uuid.lastIndexOf("/") + 1).substr(0, 8)
			return uuid_Out + Date.now() //21位
		},

		// 从localStorage中获取user UUID & POS
		getinfo() {
			// Get UUID
			if (localStorage.getItem("uuid")) {
				if (localStorage.getItem("uuid").length == 21) {
					this.user_ID = localStorage.getItem("uuid")
				} else {
					localStorage.setItem("uuid", this.getUUID())
					this.user_ID = localStorage.getItem("uuid")
				}
			} else {
				localStorage.setItem("uuid", this.getUUID())
				this.user_ID = localStorage.getItem("uuid")
			}
			// Get POSITION
			if (localStorage.getItem("position")) {
				this.user_POS = localStorage.getItem("position")
			} else {
				localStorage.setItem("position", "normal")
				this.user_POS = localStorage.getItem("position")
			}
		},

		// 判断并显性发布POS
		isadmin() {
			if (this.user_POS == "admin") {
				this.info = "聊天室（ADMIN）"
			} else {
				this.info = "聊天室"
			}
		},

		// 发送消息
		sendmsg() {
			const that = this
			const text = encodeURIComponent(that.inputMsg)
			if (that.inputMsg.length > 0 && that.inputMsg.length < 1000) {
				if (!(that.runcommend(that.inputMsg))) {
					const date = that.getformatdate()
					const name = that.picktext(that.inputMsg)
					$.post("../php/add.php",
						{
							uuid: that.user_ID,
							pos: that.user_POS,
							text: text,
							date: date,
							name: name
						},
						() => {
							that.inputMsg = ""
							that.tip_name = ""
						})
						.fail((err) => {
							alert("尝试联系服务器，但是失败了。请稍后重新发送！Error:" + err)
							console.error("sendmsg failed. error: " + err)
						})
					// alert(`${text}  ${name}  ${date}`)
				}
			} else {
				alert("内容不得小于1字或大于500字")
			}
		},

		// 发送照片
		update_img () {

		},

		// 直接更新#logs列表（备用）
		/*update() {
			var that = this
			$.post("../php/poll.php",
				{
					uuid: that.user_ID,
				},
				(result) => {
					if (result) {
						that.logs_Cont = result
						that.$nextTick(() => {
							setTimeout(() => {
								that.longpolling()
								that.scrolltobottom()
							}, 1000)
      					})
					}
				})
				.fail((error) => {
					console.error("Update() Error: " + that.getformatdate("short") + " " + Date.now() + " " + error)
					setTimeout(function () {
						that.update()
					}, 2000)
				})
		},*/

		// 长轮询
		longpolling() {
			const that = this
			const num = $(".logs").children().length
			$.post("../php/longpolling.php",
				{
					uuid: that.user_ID,
					num: num,
				},
				(result) => {
					if (result) {
						that.refreshDOM(result)
						console.info(`消息数: ${num} ${result}`)
						if (result[result.length - 1].uuid != that.user_ID) {
							that.notify()
						}
					} else {
						setTimeout(() => {
							that.longpolling()
						}, 2000)
					}
				})
				.fail(() => {
					console.info(`LongPolling() Error: ${that.getformatdate("short")} ${Date.now()}`)
					// alert(`LongPolling() Error: ${that.getformatdate("short")} ${Date.now()}`)
					setTimeout(() => {
						that.longpolling()
					}, 2000) //循环
				})
		},

		// 命令#logs滚动到底端
		scrolltobottom() {
		// while ($(".logs").prop("scrollHeight") != $(".logs").css("scrollHeigh")) {
			  $(".logs").stop()
			  const scrollHeight = $(".logs").prop("scrollHeight")
			  //$(".logs").css({ scrollTop: scrollHeight })
			  $(".logs").animate({ scrollTop: scrollHeight }, 400)
			// }
		},


		// 获取格式化的时间
		getformatdate(isshort) {
			const nowDate = new Date()
			var day
			const month = nowDate.getMonth() + 1 < 10 ? "0" + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1
			const date = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate()
			const hour = nowDate.getHours() < 10 ? "0" + nowDate.getHours() : nowDate.getHours()
			const minute = nowDate.getMinutes() < 10 ? "0" + nowDate.getMinutes() : nowDate.getMinutes()
			const second = nowDate.getSeconds() < 10 ? "0" + nowDate.getSeconds() : nowDate.getSeconds()
			switch (nowDate.getDay()) {
				case 0: day = "周日" 
				break
				case 1: day = "周一" 
				break
				case 2: day = "周二" 
				break
				case 3: day = "周三" 
				break
				case 4: day = "周四" 
				break
				case 5: day = "周五" 
				break
				case 6: day = "周六"
			}
			if (isshort == "short") {
				return (hour + ":" + minute + ":" + second)
			} else {
				return (month + "/" + date + " " + day + " " + hour + ":" + minute)
			}
		},

		// 删除消息（beta）
		/*
		deletemsg() {
		  var obj_index = menu_Obj.parents(".msg").index()
		  var obj_uuid = logs_Cont[obj_index].uuid
		  $.post("../php/delete.php",
			{
			  uuid: user_ID,
			  pos: user_POS,
			  id: obj_index,
			  obj_uuid: obj_uuid
			},
			(result)=>{
			  update()
			  scrollToBottom()
			  alert(result)
			})
		},
		*/

		// 检索指令
		runcommend(text) {
			if (text == "/C GET ADMIN") {
				this.user_POS = "admin"
				localStorage.setItem("position", "admin")
				this.isadmin()
				return "/C GET ADMIN"
			} else if (text == "/C GET NORMAL") {
				localStorage.setItem("position", "normal")
				this.user_POS = localStorage.getItem("position")
				this.isadmin()
				return "/C GET NORMAL"
			} else if (text.indexOf("/C NOTIFY") == 0) {
				const index = text.substring(10)
				this.notify(index)
				return "/C NOTIFY"
			}
		},

		// 在st_List中寻找匹配姓名
		picktext(toPick) {
			var to_name = ""
			for (name of this.st_List) {
				if (toPick.indexOf(name) > -1) {
					if (!to_name) {
						to_name = name
					} else {
						to_name += " " + name
					}
				}
			}
			// 无匹配姓名
			return to_name
		},

		// 桌面端的通知事件
		notify(index) {
			if (!("Notification" in window)) {
				console.warn("This browser does not support desktop notification")
			}
			else if (Notification.permission == "granted") {
				const aim_Index = (index) ? (index) : (this.logs_Cont.length - 1)
			  const noti_Cont = (this.logs_Cont[aim_Index].name) ? ("To " + this.logs_Cont[aim_Index].name) : (this.logs_Cont[aim_Index].text)
				noti_Cont = decodeURIComponent(noti_Cont)
				const n = new Notification("聊天室", {
					body: noti_Cont
				})
			}
			else if (Notification.permission != "denied") {
				Notification.requestPermission()
			}
		},

		// 移除菜单的验证
		menu_listener(event) {
			if (this.menu_status == "on") {
				if (event.pageX > this.menu_x + $("#menu").width() || event.pageX < this.menu_x || event.pageY < this.menu_y || event.pageY > this.menu_y + $("#menu").height()) {
					this.menu_close()
				}
			}
		},

		// 打开菜单
		menu_open(event, index) {
			this.menu_x = event.pageX
			this.menu_y = event.pageY
			this.menu_obj = $(".logs").children().eq(index)
			const uuid = this.logs_Cont[index].uuid
			$("body").append(`<div class="menu" id="menu"><div id="menu_id"></div><div id="menu_uuid"></div><div id="delete">删除</div></div>`)
			$("#menu").css("left", this.menu_x)
			$("#menu").css("top", this.menu_y)
			$("#menu").fadeIn(0)
			$("#menu").animate({ height: "70px", width: "180px" }, 200)
			$("#menu_id").fadeIn(400).text("id: " + index)
			$("#menu_uuid").fadeIn(500).text("uuid: " + uuid)
			$("#delete").fadeIn(400)
			$(".back_pos").css({ pointerEvents: "auto" })
			this.menu_status = "on"
		},

		// 关闭菜单
		menu_close() {
			$("#menu").remove()
			$(".back_pos").css({ pointerEvents: "none" })
			this.menu_status = "off"
		},

		// 判断msgtext所属类
		isself(uuid) {
			if (uuid == this.user_ID) {
				return ["msgtext_self", "msgname_self"]
			} else {
				return ["msgtext", "msgname"]
			}
		},

		// 判断是否为图片
		ispic(text) {
			if (text.indexOf("<img ") == 0) {
				return text
			} else {
				return `<div class="textspan">${text}</div>`
			}
		}
	}
})







// msg组件
App.component("msg-vue", {
	props: ["name", "text", "time", "msg_text"],

  computed: {
    decodemsg() {
      return decodeURIComponent(this.text)
    }
  },

	inheritAttrs: false, // 阻止css属性继承

	template: `
    <div class="msg">
      <div class="msgtime">
        {{time}}
      </div>

      <div :class="msg_text[0]" 
      @contextmenu.prevent="$emit('openMenu',$event)" 
      v-if="text.indexOf('/SYSTEMMSG') == -1">
        <div v-html="decodemsg"></div>
			</div>

      <div :class="msg_text[1]" v-if="name">
        {{name}}
			</div>
    </div>
  `,
})

App.mount("#app")