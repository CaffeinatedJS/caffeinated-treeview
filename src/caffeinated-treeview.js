!function($) {

	window.String.prototype.toBoolean = function() {
		if (this.toString() === "false") return false
		return true
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


	var Tree = function(element, options) {
		this.$element = $(element)
		this.options = $.extend({}, Tree.DEFAULTS, options)
		this.rend()
	}

	Tree.prototype = {

		constructor			: Tree

		, rend				: function(){
			var $element = this.$element
				, options = this.options
				, data = options.data

			//Rend Static Nodes
			if ($element.children().length)
				this.rendStaticNodes()

			//Rend nodes from data
			if (data)
				this.rendDataNodes(data)

			//Register node events listeners
			//this.regEventsListeners()

		}

		, rendStaticNodes	: function(){
			
			var $element = this.$element
				, options = this.options

			//*
			//Detect and wrap base dom with div
			if ($element[0].nodeName.toLowerCase() === "ul") {
				var wrapper = $("<div/>")
						.attr("id", $element.attr("id"))
						.addClass($element.attr("class"))
				
				$element
					.removeAttr("id")
					.removeAttr("class")
					.wrap(wrapper)
				
				$element = this.$element = $element.parent()

				if (options.panelMenu)
					$element.attr("context-menu", options.panelMenu)
			}
			//*/
			$element.addClass("tree-view")
			
			//Process folder node
			this.rendFolderNodes($element.find("ul"))
			this.rendItemNodes($element.find("li"))
		}

		, rendFolderNodes	: function(nodes) {
			
			var $element = this.$element
				, options = this.options
				, processIcon = this.processIcon
				, processCheckBox = this.processCheckBox

			nodes.each(function() {
				
				var $this = $(this)
					, children = $this.children()
					, checkable
						= ($this.attr("checkable")
							|| options.allCheckable.toString()).toBoolean()
					//, checked = $this.attr("box-checked") || options.allChecked
					, checkDisabled
						= ($this.attr("check-disabled")
							|| options.allCheckDisabled.toString()).toBoolean()
					, collapsed = $this.attr("collapsed") || options.allCollapsed
					, title = $('<span class="title-label"/>')
						.text($this.attr("title"))
						.wrap('<div class="node-title"'
							+ (options.folderMenu 
								? ' context-menu="' + options.folderMenu + '"' 
								: ' ' )
							+ '/>')
						.parent()
					, content = $('<div class="node-content"/>')

				$this.prepend(title)

				/*
				if (checkable) {
					var checkBoxIcon = $('<span class="icon check-box"/>')
					checkBoxIcon
						.addClass(checked ? "checked" : "")
					title.prepend(checkBoxIcon)
				}*/
				processCheckBox($this, options)

				if (checkDisabled) {
					checkBoxIcon.addClass(checkDisabled ? "disabled" : "")
					$this.find("li, ul").attr("check-disabled", "true")
				}

				if (collapsed) {
					$this.removeClass("toggle-open")
				} else {
					$this.addClass("toggle-open")
				}

				//Insert folder icon
				processIcon($this, options)

				//Insert toggle icon
				if (children.length) {
					children.wrapAll(content)
					title.prepend('<span class="icon icon-tree-toggle"/>')
				} else {
					$this.append(content)
					title.prepend('<span class="icon icon-tree-toggle-empty"/>')
				}

			})

		}

		, rendItemNodes		: function(nodes) {
			
			var $element = this.$element
				, options = this.options
				, processCheckBox = this.processCheckBox
				, processIcon = this.processIcon
				, contextmenu = options.itemMenu

			nodes.each(function() {

				var $this = $(this)
					, checkDisabled = $this.attr("check-disabled") === "true"
						 || options.allCheckDisabled
				
				if (contextmenu) $this.attr("context-menu", contextmenu)

				processCheckBox($this, options)
				processIcon($this, options)

				if (checkDisabled)
					$this.find(".check-box").addClass("disabled")


			})

		}

		, processIcon		: function(node, options){

			if (!(node.attr("icon")
					|| options.allHasIcon.toString()).toBoolean())
				return
			
			var iconType = node[0].nodeName.toLowerCase() === "ul"
					? "folder" : "item"
				, nodeIcon 
					= "icon "
					+ (node.attr("icon")|| options.icons[iconType])
				, iconElement = '<span class="' + nodeIcon + '"/>'

				if (iconType === "folder") {
					node.find(".node-title").prepend(iconElement)
				} else
					node.prepend(iconElement)

		}

		, processCheckBox	: function(node, options){
			
			if (!(node.attr("checkable")
					|| options.allCheckable.toString()).toBoolean())
				return

			var nodeType = node[0].nodeName.toLowerCase() === "ul"
					? "folder" : "item"
				, checked = (node.attr("box-checked") || options.allChecked)
					.toString().toBoolean()
				, checkDisabled
					= (node.attr("check-disabled")
						|| options.allCheckDisabled.toString()).toBoolean()
				, checkBox = $('<span class="icon check-box"/>')

			if (checked) {
				checkBox.addClass("checked")
			}

			if (nodeType === "folder") {
				node.find(".node-title").prepend(checkBox)
			} else {
				node.prepend(checkBox)
			}

		}

		, rendDataNodes		: function() {
			
		}

		, getSelectedNodes	: function() {
			var nodes = []

		}

		, getSelectedValues	: function(){
			
		}

		, getCurrentItem	: function(){
			
		}

	}

	Tree.DEFAULTS = {
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
		, icons	: {
			"folder" 			: "icon-tree-folder"
			, "item"			: "icon-tree-item"
			, "toggle-open"		: "icon-tree-toggle-open"
			, "toggle-closed"	: "icon-tree-toggle-closed"
		}
		, allCollapsed		: false
		, allHasIcon		: true
		, allCheckable		: true
		, allChecked		: false
		, allCheckDisabled	: false
		, dataMap			: {
			root	: ""
		}
		//Context Menu Define
		, folderMenu		: ''
		, itemMenu			: ''
		, panelMenu			: ''
		//Overflow Behaviour Define
		, overflow			: "scroll"// Or 'resize'
	}


	var _tree = $.fn.tree
	
	$.fn.tree = function(option) {
		return this.each(function() {
			
			var $this = $(this)
				, options = $.extend({}
					, Tree.DEFAULTS
					, typeof option === "object" && option)
				, data = $this.data("tree")

			if (!data) $this.data("tree", (data = new Tree(this, options)))
			if (typeof option === 'string') data[option]()

		})
	}
	
	$.fn.tree.noConflict = function() {
		$.fn.tree = _tree
		return this
	}

	$(document)
		.on('click.tree-view.check-box.folder'
			, '.tree-view ul > .node-title > .check-box', function() {

				if ($(this).hasClass("disabled")) return

				var $this = $(this)
					, allChilds = $this.parent().next().find('.check-box')
					, avilableChilds = $this.parent().next().find('.check-box:not([class~="disabled"])')
					, parents = $this.closest("ul")
						.parentsUntil(".tree-view", "ul")
					, dblchecks = $this.closest("ul").find('.node-title > .check-box')

				$this.toggleClass("checked")
					.addClass("half")

				if ($this.hasClass("checked"))
					avilableChilds.addClass("checked")
				else
					avilableChilds.removeClass("checked")

				var checkedChilds = $this.parent().next().find('.check-box.checked')

				if (allChilds.length === checkedChilds.length)
					$this.removeClass("half")

				checkParentsStat(parents)

				//*
				dblchecks.each(function() {
					var $that = $(this)
						, childs = $that.parent().next().find('.check-box')
						, checkedChilds = $that.parent().next().find('.check-box.checked')
					
					if (childs.length !== checkedChilds.length
						&& checkedChilds.length > 0) {
						
						$that.addClass("half")
					} else
						$that.removeClass("half")
					
				})
				//*/

			})
		.on('click.tree-view.check-box.item'
			, '.tree-view li > .check-box', function() {
				if ($(this).hasClass("disabled")) return
				$(this).toggleClass("checked")
				var parents = $(this).parentsUntil(".tree-view", "ul")
				checkParentsStat(parents)
			})
		.on('click.tree-view.toggle'
			, '.tree-view ul > .node-title > .icon-tree-toggle', function() {
				$(this).closest("ul").toggleClass("toggle-open")
			})
		.on('dblclick.tree-view.foldericon'
			, '.tree-view .icon.icon-tree-folder', function() {
				$(this).closest("ul").toggleClass("toggle-open")
			})
		.on('click.tree-view.select contextmenu.tree.select'
			, '.tree-view .icon, .tree-view .title-label, .tree-view a', function(e) {
				var $this = $(this).parent()
					, root = $this.closest(".tree-view")
					, others = root.find(".node-title, li")
				others.removeClass("selected")
				$this.addClass("selected")
			})
		.on('contextmenu.tree'
			, '.tree-view, .tree-view .icon, .tree-view .title-label, .tree-view a', function(e) {
				
				var $this = $(this)
					, target = $this.hasClass("tree-view") ? $this : $this.parent()
					, contextmenu = target.attr("context-menu")
					, pointX = e.clientX - 10
					, pointY = e.clientY - 5
					, menu = $("#" + contextmenu)

				$(".dropdown-menu").removeClass("show")

				menu.css("top", pointY)
					.css("left", pointX)
					.addClass("show")

				$(document)

				return false
			})
		/*.on("click.contextmenu.off contextmenu.contextmenu.off", function(e) {
				$(".dropdown-menu").removeClass("show")
			})*/
	
	var checkParentsStat = function(parents) {
		parents.each(function() {
			var parent = $(this)
				, isAllChecked
					= parent.find(".node-content .check-box").length
						=== parent.find(".node-content .check-box.checked").length
				, isHalfChecked
					 = !isAllChecked
					 && parent.find(".node-content .check-box.checked").length > 0 
				, checkBox = parent.children(".node-title").find(".check-box")

			checkBox.removeClass("checked")
			checkBox.removeClass("half")

			if (isHalfChecked)
				checkBox.addClass("half checked")
			if (isAllChecked)
				checkBox.addClass("checked")
		})
	}

	$(document).on("change.tee-view.folder", ".tree-view .node-title .check-box", function() {
		console.log("123")
	})
	
} (window.jQuery)