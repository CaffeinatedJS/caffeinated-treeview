!function($) {

	window.String.prototype.toBoolean = function() {
		var str = this.toString()
		return this.toString() !== "false"
				&& this.toString() !== "undefined"
	}
	
	Object.defineProperty(
		Object.prototype
		, 'getSubObject'
		, {
			value		: function(p) {

				if (p.constructor !== String) return this
				
				var path = p.trim().split('.')
					, val = this
					, i = 0

				while(path[i] !== undefined
					&& (val = val[path[i]]) !== undefined) {
					++i
				}

				return val
			}
			, enumerable: false
		}
	)

	$.fn.removeProps = function(props) {
		//TODO 
	}


	/*
	 * Class define section
	 */

	var TreeView = function(element, options) {
		this.$element = $(element)
		this.options = $.extend({}, TreeView.DEFAULTS, options)
		this.rend()
	}

	TreeView.prototype = {

		constructor		: TreeView

		, rend			: function() {

			this.rendStaticNodes()
			//this.rendDynamicNodes()

		}

		, rendStaticNodes	: function($el) {

			var $dom = $el || this.$element
				, options = this.options
				, data = this.dom2data($dom)

			if ($dom[0].nodeName.toLowerCase() === "ul") {
				var wrapper = $("<div/>")
					, rootAttrs = {
						id		: $dom.attr("id")
						, class	: $dom.attr("class")
						, title	: $dom.attr("title")
						, style	: $dom.attr("style")
					}

				wrapper.prop(rootAttrs)
					.addClass("tree-view")
				

				//TODO it could be more clearly
				$dom
					.removeAttr("id")
					.removeAttr("class")
					.removeAttr("title")
					.removeAttr("style")
					.wrap(wrapper)
				
				$dom = this.$element = $dom.parent()

				if (options.panelMenu)
					$dom.attr("contextmenu", options.panelMenu)
			}
			
			$dom.html("")
			this.rendDynamicNodes(data)

		}

		, dom2data			: function($dom) {
			
			var $dom = $dom || this.$element
				, options = this.options
				, datas = []
				, dom2data = this.dom2data
				, that = this

			$dom.each(function() {
				var data = {

						title		: $dom.attr("title") || $dom.text()
						, type			: "item"
						, isOpen		: $dom.hasClass("toggle-open")
											|| options.allDefaultOpen

						//icon
						, hasIcon		: ($dom.attr("icon") !== undefined)
											|| options.allHasIcon
						, icon			: $dom.attr("contextmenu")
											|| options.icons.item
						//check-box
						, checkable 	: $dom.attr("checkable")
											|| $dom.hasClass("checkable")
											|| options.allCheckable
						, checked		: $dom.attr("box-checked")
											|| $dom.hasClass("checked")
											|| options.allChecked
						, checkDisabled	: $dom.attr("check-disabled")
											|| $dom.hasClass("check-disabled")
											|| options.allCheckDisable
						//context-menu
						, contextmenu	: $dom.attr("contextmenu")
											|| options.itemMenu
						//actions
						, dataToggle	: $dom.data("toggle")
											|| $dom.children("a:first").data("toggle")
						, toggleTarget	: $dom.attr("href")
											|| $dom.children("a:first").attr("href")

					}

				for (var n in data) {
					var d = data[n]
					if(d === "false" || d == undefined) data[n] = false
				}

				if ($dom[0].nodeName.toLowerCase() === "ul") {
					
					var childs = $dom.children()

					//this.ul2data($dom, data)
					data.type = "folder"
					data.contextmenu = $dom.attr("contextmenu")
										|| options.folderMenu

					if (childs.length > 0) {

						data.childs = []

						$dom.children().each(function() {
							var $this = $(this)
							data.childs.push(
								dom2data.call(that, $this, data.childs))
						})
					}
				}

				datas.push(data)
			})

			return datas
		}

		, rendDynamicNodes	: function(dat, $tgt) {
			

			var datas = dat || this.options.data

			if ($(datas) === "object") datas = [datas]

			for (var i = 0; i < datas.length; i++) {
				
				var data = datas[i]

				if (data.type !== "folder" && data.type !== "item") continue

				var $target = $tgt || this.$element
					, $node

				if (data.type === "folder")
					$node = this.data2ul(data)

				if (data.type === "item")
					$node = this.data2li(data)

				$target.append($node.attr("contextmenu", data.contextmenu))

				if (!data.childs) continue

				for (var i = 0; i < data.childs.length; i++) {
					var child = data.childs[i]
					if (data.checkDisabled)
						child.checkDisabled = data.checkDisabled
					this.rendDynamicNodes(child, $node.children(".node-content"))
				}

			}

			


		}

		, data2ul			: function(data) {
			var $wrapper = $('<ul/>')
				, $nodeTitle = $('<div class="node-title" />')
				, $nodeContent = $('<div class="node-content" />')
				, $iconArrow = $('<span class="icon icon-tree-toggle"/>')
				, $iconFolder = $('<span class="icon icon-tree-folder"/>')
				, $iconLabel = $('<span class="title-label">'
					+ data.title + '</span>')


			//Make parts together
			$wrapper.append($nodeTitle)
				.append($nodeContent)


			//Process toggle arrow
			if (!(data.childs && data.childs.length))
				$iconArrow.addClass("empty")
			$nodeTitle.append($iconArrow)


			//Process icon
			if (data.hasIcon)
				$nodeTitle.append(this.makeIcon(data))


			//Process node state
			if (data.isOpen)
				$wrapper.addClass("toggle-open")


			//Process node checkbox
			if (data.checkable)
				$nodeTitle.append(this.makeCheckBox(data))


			$nodeTitle.append($iconLabel)
			return $wrapper
		}

		, data2li			: function(data) {
			var $wrapper = $('<li/>')
				, $link = $('<a/>')

			$link.text(data.title)
				.attr("href", data.toggleTarget)
				.data("toggle", data.dataToggle)

			if (data.checkable)
				$wrapper.prepend(this.makeCheckBox(data))

			if (data.hasIcon) 
				$wrapper.prepend(this.makeIcon(data))

			$wrapper.append($link)
				.addClass("item")


			return $wrapper

		}

		, makeCheckBox		: function(data){

			var $checkbox = $('<span/>')
				, classes = "icon check-box"

			if (data.checked)
				classes += " checked"

			if (data.checkDisabled)
				classes += " disabled"

			return $checkbox.addClass(classes)
			
		}

		, makeIcon			: function(data){
			
			var $icon = $('<span />')
				, type = "icon icon-tree-" + data.type

			return $icon.addClass(type)

		}

		, addFolderTo		: function(node, $to) {

			var $folder = $("<ul/>")
			
			//TODO:folder dom create job

			$to.append($folder)

		}

		, addItemTo			: function(node, $to) {
			
		}

		

	}

	TreeView.DEFAULTS = {

		/*
		method: "POST",
		datatype: "json",
		url: false,
		cbiconpath: "/images/icons/",
		//icons: ["checkbox_0.gif", "checkbox_1.gif", "checkbox_2.gif"],
		checked: false, //是否显示选择
		oncheckboxclick: false, //当checkstate状态变化时所触发的事件，但是不会触发因级联选择而引起的变化
		onnodeclick: false,
		cascadecheck: true,
		data: null,
		clicktoggle: true, //点击节点展开和收缩子节点
		theme: "bbit-tree-arrows" //bbit-tree-lines ,bbit-tree-no-lines,bbit-tree-arrows
		*/
		, icons	: {
			"folder" 			: "icon-tree-folder"
			, "item"			: "icon-tree-item"
			, "toggle-open"		: "icon-tree-toggle-open"
			, "toggle-closed"	: "icon-tree-toggle-closed"
		}
		, allCollapsed		: false
		, allDefaultOpen	: false
		, allHasIcon		: true
		, allCheckable		: true
		, allChecked		: false
		, allCheckDisabled	: false
		, keyDict			: {
			root			: "root"
			, title			: "title"
			, type			: "type"
			, isOpen		: "isOpen"
			, hasIcon		: "hasIcon"
			, icon			: "icon"
			, checkable		: "checkable"
			, checked		: "checked"
			, checkDisabled	: "checkDisabled"
			, contextmenu	: "contextmenu"
			, dataToggle	: "dataToggle"
			, toggleTarget	: "toggleTarget"
		}
		//Context Menu Define
		, folderMenu		: ''
		, itemMenu			: ''
		, panelMenu			: ''
		//Overflow Behaviour Define
		, overflow			: "scroll"// Or 'resize'
	}



	/*
	 * Plug-in regist section
	 */

	var _tree = $.fn.tree
	
	$.fn.tree = function(option) {
		return this.each(function() {
			
			var $this = $(this)
				, options = $.extend({}
					, TreeView.DEFAULTS
					, typeof option === "object" && option)
				, data = $this.data("tree")

			if (!data) $this.data("tree", (data = new TreeView(this, options)))
			if (typeof option === 'string') data[option]()

		})
	}
	
	$.fn.tree.noConflict = function() {
		$.fn.tree = _tree
		return this
	}



	/*
	 * Event bind section
	 */

	//Define event handler
	var folderCheckStateHandler = function() {}
		, itemCheckStateHandler = function() {}
		, clearContextMenuHandler = function() {}

	//Bind event
	$(document)
		

		//Bind Tree View item/folder check-box state change event
		.on("click.tree-view.item.check-box"
			, ".tree-view .item .check-box", function(e) {
				
				var $this = $(this)
				if ($this.hasClass("disabled")) return

				$this.toggleClass("checked")

				var $parents = $this.parentsUntil(".tree-view", "ul")
					, $parentChks = $parents.find("> .node-title .check-box")

				$parentChks.trigger("change.tree-view.item.checkstate")

			})
		.on("click.tree-view.folder.check-box"
			, ".tree-view .node-title .check-box", function(e) {
				//
				var $this = $(this)
				if ($this.hasClass("disabled")) return

				//
				$this.toggleClass("checked")
					.removeClass("half")

				var	$nodeContent = $this.parent().next()
					, allchks = $nodeContent.find(".check-box")
					//, dischks = $nodeContent.find(".check-box.disabled").length
					, avlchks = $nodeContent.find(".check-box:not([class~='disabled'])")
					, dischks = allchks.length - avlchks.length
				//*
				if (dischks > 0 && dischks < allchks.length)
					$this.addClass("half")

				
				if ($this.hasClass("checked"))
					avlchks.addClass("checked")
				else
					avlchks.removeClass("checked")
				//*/
				//
				var $parentUls = $this.closest("ul").parentsUntil(".tree-view", "ul")
					, $childChks = $this.parent().next().find(".node-title .check-box")
					, $parentChks = $parentUls.find("> .node-title .check-box")

				//$this.trigger("change.tree-view.item.checkstate")
				$parentChks.trigger("change.tree-view.item.checkstate")
				$childChks.trigger("change.tree-view.item.checkstate")

			})
		.on("change.tree-view.item.checkstate"
			, ".tree-view .node-title .check-box", function(e) {
				
				var $this = $(this)
				if ($this.hasClass("disabled")) return

				var	$nodeContent = $this.parent().next()
					, allchks = $nodeContent.find(".check-box").length
					, unchks = $nodeContent.find(".check-box:not([class~='checked'])").length

				$this.removeClass("checked half")

				if(!allchks) {
					if ($this.closest("ul")
						.parent().prev()
						.find(".check-box")
						.hasClass("checked"))
						$this.addClass("checked")
					return
				}

				if(allchks - unchks > 0)
					$this.addClass("checked")

				if(unchks > 0)
					$this.addClass("half")

			})
		/*
		.on("change.tree-view.folder.checkstate"
			, ".tree-view .item .check-box", function(e) {
				var $this = $(this)
				if ($this.hasClass("disabled")) return

				var	$nodeContent = $this.parent().next()
					, allchks = $nodeContent.find(".check-box")
					, avlchks = $nodeContent.find(".check-box:not([class~='disabled'])")
					, dischkCount = allchks.length - avlchks.length

				if (dischks > 0 && dischks < allchks.length)
					$this.addClass("half")

				//
				if ($this.hasClass("checked"))
					avlchks.addClass("checked")
				else
					avlchks.removeClass("checked")

			})
		//*/

		
		//Bind Tree View folder toggle event
		.on("click.tree-view.folder-arrow"
			, ".tree-view .node-title .icon-tree-toggle", function(e) {
				$(this).closest("ul").toggleClass("toggle-open")
			})
		.on("dblclick.tree-view.folder-icon"
			, ".tree-view .node-title .icon-tree-folder", function(e) {
				$(this).closest("ul").toggleClass("toggle-open")
			})


		//Bind Tree View select event
		.on("click.tree-view.select contextmenu.tree-view.select"
			, ".tree-view .icon, .tree-view .title-label, .tree-view a", function(e) {
				var $this = $(this).parent()
					, root = $this.closest(".tree-view")
					, others = root.find(".node-title, li")
				others.removeClass("selected")
				$this.addClass("selected")
			})

		
		//Bind Tree View context-menu toggle event
		.on("contextmenu.tree-view.contextmenu.show"
			, ".tree-view, .tree-view .icon, .tree-view .title-label, .tree-view a", function(e) {
				
				$(".dropdown-menu").removeClass("show")
				e.stopPropagation()
				
				var $this = $(this)
					, target = $this.hasClass("tree-view") ? $this : $this.parent()
					, contextmenu = target.closest("ul, li, .tree-view").attr("contextmenu")

				if(!contextmenu) return true

				var pointX = e.clientX - 10
					, pointY = e.clientY - 5
					, menu = $("#" + contextmenu)

				$(".dropdown-menu").removeClass("show")

				menu.css("top", pointY)
					.css("left", pointX)
					.addClass("show")

				return false
			})
		.on("click.tree-view.contextmenu.hide contextmenu.tree-view.contextmenu.hide"
			, function(e) {
				$(".dropdown-menu").removeClass("show")
			})

	
} (window.jQuery)