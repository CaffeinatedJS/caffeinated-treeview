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
			this.rendDynamicNodes()

		}

		, rendStaticNodes	: function($el) {

			var $dom = $el || this.$element
				, data = this.domToData($dom)

			//TODO:do dom wrap job

			this.rendDynamicNodes(data)

		}

		, domToData			: function($dom) {
			
			var data = {}

			return data;
		}

		, rendDynamicNodes	: function(data) {
			

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
			, "", function(e) {
				//
			})
		.on("click.tree-view.folder.check-box"
			, "", function(e) {
				//
			})
		.on("change.tree-view.item.checkstate"
			, "", function(e) {
				//
			})
		.on("change.tree-view.folder.checkstate"
			, "", function(e) {
				//
			})
		
		//Bind Tree View folder toggle event
		.on("click.tree-view.folder-arrow"
			, "", function(e) {
				//
			})
		.on("dblclick.tree-view.folder-icon"
			, "", function(e) {
				//
			})

		//Bind Tree View select event
		.on("click.tree-view.select contextmenu.tree-view.select"
			, "", function(e) {
				//
			})

		//Bind Tree View context-menu toggle event
		.on("contextmenu.tree-view.contextmenu.show"
			, "", function(e) {
				//
			})
		.on("click.tree-view.contextmenu.hide contextmenu.tree-view.contextmenu.hide"
			, "", function(e) {
				//
			})

	
} (window.jQuery)