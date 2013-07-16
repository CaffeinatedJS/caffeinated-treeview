!function($) {

	window.String.prototype.toBoolean = function() {
		if (this.toString() === "false") return false
		return true
	}

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
			if($element.children().length)
				this.rendStaticNodes()

			//Rend nodes from data
			if(data)
				this.rendDataNodes(data)

			//Register node events listeners
			//this.regEventsListeners()

		}

		, rendStaticNodes	: function(){
			
			var $element = this.$element
				, options = this.options

			//Detect and wrap base dom with div
			if($element[0].nodeName.toLowerCase() === "ul") {
				var wrapper = $("<div/>")
						.attr("id", $element.attr("id"))
						.addClass($element.attr("class"))

				$element
					.removeAttr("id")
					.removeAttr("class")
					.wrap(wrapper)
				$element = this.$element = $element.parent()
			}
				 
			$element.addClass("tree-view")
			
			//Process folder node
			this.rendFolderNodes($element.find("ul"))
			this.rendItemNodes($element.find("li"))
		}

		, rendFolderNodes	: function(nodes) {
			
			var $element = this.$element
				, options = this.options
				, processIcon = this.processIcon

			nodes.each(function() {
				
				var $this = $(this)
					, children = $this.children()
					, checkable
						= ($this.attr("checkable")
							|| options.allCheckable.toString()).toBoolean()
					, checked = $this.attr("checked") || options.allChecked
					, checkDisabled
						= ($this.attr("check-disabled")
							|| options.allCheckDisabled.toString()).toBoolean()
					, collapsed = $this.attr("collapsed") || options.allCollapsed
					, title = $('<div class="node-title"/>')
						.text($this.attr("title"))
					, content = $('<div class="node-content"/>')

				$this.prepend(title)

				if(checkable) {
					var checkBoxIcon = $('<span class="icon check-box"/>')
					checkBoxIcon
						.addClass(checked ? "checked" : "")
						.addClass(checkDisabled ? "disabled" : "")
					title.prepend(checkBoxIcon)
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

			nodes.each(function() {

				var $this = $(this)
				
				processCheckBox($this, options)
				processIcon($this, options)

			})

		}

		, processIcon		: function(node, options){

			if(!(node.attr("icon")
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
			
			if(!(node.attr("checkable")
					|| options.allCheckable.toString()).toBoolean())
				return

			var nodeType = node[0].nodeName.toLowerCase() === "ul"
					? "folder" : "item"
				, checked = node.attr("checked") || options.allChecked
				, checkDisabled
					= (node.attr("check-disabled")
						|| options.allCheckDisabled.toString()).toBoolean()
				, checkBox = $('<span class="icon check-box"/>')

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
	}


	var _tree = $.fn.tree
	
	$.fn.tree = function(option) {
		return this.each(function() {
			
			var $this = $(this)
				, options = $.extend({}
					, Tree.DEFAULTS
					, typeof object === "object" && option)
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
		.on('click.tree.check-box.folder'
			, '.tree-view ul > .node-title > .check-box', function() {

				if($(this).hasClass("disabled")) return

				var $this = $(this)
					, childs = $this.parent().next().find(".check-box")
					, parents = $this.closest("ul")
						.parentsUntil(".tree-view", "ul")

				$this.toggleClass("checked")
					.removeClass("half-checked")
				if($this.hasClass("checked"))
					childs.addClass("checked")
				else
					childs.removeClass("checked")
				//parent.toggleClass("half-checked")
				checkParentsStat(parents)

				$(document).trigger("check", '.tree-view ul')

			})
		.on('click.tree.check-box.item'
			, '.tree-view li > .check-box', function() {
				$(this).toggleClass("checked")
				var parents = $(this).parentsUntil(".tree-view", "ul")
				checkParentsStat(parents)
			})
		.on('click.tree.toggle'
			, '.tree-view ul > .node-title > .icon-tree-toggle', function() {
				$(this).closest("ul").toggleClass("toggle-open")
			})
	
	var checkParentsStat = function(parents) {
		parents.each(function() {
			var parent = $(this)
				, isAllChecked
					= parent.find(".node-content .check-box").length
						=== parent.find(".node-content .check-box.checked").length
				, isHalfChecked
					 = !isAllChecked
					 && parent.find(".check-box.checked").length > 0 
				, checkBox = parent.children(".node-title").find(".check-box")

			checkBox.removeClass("checked")
			checkBox.removeClass("half-checked")

			if(isHalfChecked)
				checkBox.addClass("half-checked")
			if(isAllChecked)
				checkBox.addClass("checked")
		})
	}
	
} (window.jQuery)