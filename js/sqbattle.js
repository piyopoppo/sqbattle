(function($) {
	/*
		Short vars Declaration
	*/
	var ga = null; // #game-area
	var IMGPATH = "./images/";

	/*
		Object Declaration
	*/
	function BattleField(){}
	BattleField.prototype = {
		enemies: new Array(),
		players: new Array(),
		commands: new Array(),
		actions: new Array(),
		playerAlignment: 2,
		init: function(playerAlignment) {
			this.playerAlignment = playerAlignment;
			this.initPlayerStatusWindow();
			this.refreshPlayerStatusWindow();
			this.initEnemyPosition();
			var _this = this;
			setTimeout(function() {
				_this.showInitialMessage();
				setTimeout(function() {
					_this.startCommandSelect();
				}, MessageWindow.prototype.defaultMessageSpeed);
			}, 500);

			// Event set
			ga.on("onBattleCommand", this.onBattleCommand);
			ga.on("onPlayerCommandSelectionEnd", this.onPlayerCommandSelectionEnd);
		},
		startCommandSelect: function() {
			MessageWindow.prototype.skip();
			CommandWindow.prototype.open();
			MessageWindow.prototype.push("どうする？");
		},
		initPlayerStatusWindow: function() {
			var backs = this.players.length - (this.playerAlignment + 1);
			var fronts = this.players.length - backs;
			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];
				// Make element
				ga.append('<div class="player-status" data-id="' + p.id + '"><div class="common-container"><div class="bad"></div><div class="name">' + p.name + '</div><div class="hp"></div><div class="tp"></div></div></div>');
				// Initial value
				$(".player-status[data-id=" + p.id + "] .hp", ga)
					.append('<span>HP</span><span class="value">' + p.status.hp + '</span><span class="bar"></span>');
				$(".player-status[data-id=" + p.id + "] .tp", ga)
					.append('<span>TP</span><span class="value">' + p.status.tp + '</span><span class="bar"></span>');

				// Position
				var target = $(".player-status[data-id=" + p.id + "]", ga);
				var targetX = 0; var targetY = 0;
				if (i <= this.playerAlignment) {
					// Front
					targetY = ga.height() - target.height() * 2;
					if (fronts == 1) {	// single
						targetX = ga.width() / 2 - target.width() / 2;
					}
					if (fronts == 2) {	// double
						targetX = ga.width() / 4 - target.width() / 4 + target.width() * i;
					}
					if (fronts == 3) {	// triple
						targetX = target.width() * i;
					}
				} else {
					// Back
					targetY = ga.height() - target.height() * 1;
					if (backs == 1) {	// single
						targetX = ga.width() / 2 - target.width() / 2;
					}
					if (backs == 2) {	// double
						targetX = ga.width() / 4 - target.width() / 4 - target.width() * (i - this.playerAlignment - 1);
					}
					if (backs == 3) {	// triple
						targetX = target.width() * (i - this.playerAlignment - 1);
					}
				}
				// Set position
				crossBrowserTransform(target, "translate(" + targetX + "px, " + targetY + "px)");
			}
		},
		refreshPlayerStatusWindow: function() {
			// Refresh each player status window
			for (var i = 0; i < this.players.length; i++) {
				var p = this.players[i];
				var elem = $(".player-status[data-id=" + p.id + "]", ga);
				$(".hp .value", elem).html(p.status.hp);
				$(".tp .value", elem).html(p.status.tp);
				var per = (p.status.hp / p.ability.maxhp) * 95;
				$(".hp .bar", elem).css({"width": per + "%"});
				per = (p.status.tp / p.ability.maxtp) * 95;
				$(".tp .bar", elem).css({"width": per + "%"});

				if (p.status.hp == p.ability.maxhp) {
					if (!$(".hp .bar", elem).hasClass("full")) {
						$(".hp .bar", elem).addClass("full");
					}
				} else {
					$(".hp .bar", elem).removeClass("full");
				}
				if (p.status.tp == p.ability.maxtp) {
					if (!$(".tp .bar", elem).hasClass("full")) {
						$(".tp .bar", elem).addClass("full");	
					}
				} else {
					$(".tp .bar", elem).removeClass("full");
				}
			}
		},
		initEnemyPosition: function() {
			// Make elements
			for (var i = 0; i < this.enemies.length; i++) {
				var e = this.enemies[i];
				ga.append('<div class="enemy-image" data-id="' + e.id + '"><img src="' + IMGPATH + e.image + '"></div>');
			}
			this.refreshEnemyPosition(true);
		},
		getEnemiesWidth: function() {
			var ret = 0;
			for (var i = 0; i < this.enemies.length; i++) {
				var e = this.enemies[i];
				var target = $(".enemy-image[data-id=" + e.id + "]", ga);
				ret += target.width();
			}
			return ret;
		},
		refreshEnemyPosition: function(initial) {
			var ew = this.getEnemiesWidth();
			var offsetX = (ga.width() - ew) / 2;
			
			for (var i = 0; i < this.enemies.length; i++) {
				var e = this.enemies[i];
				// Position
				var target = $(".enemy-image[data-id=" + e.id + "]", ga);
				var targetX = 0; var targetY = ga.height() * 0.5 - target.height();
				if (initial) { targetY = -100; }

				targetX = offsetX;
				offsetX += target.width();

				// Set position
				if (initial) {
					crossBrowserTransform(target, "translate(" + targetX + "px, " + targetY + "px)");
					target.css({"opacity": "0.1"});

					setTimeout(function(t) {
						crossBrowserTransition(t, "opacity 0.5s linear, -PREFIX-transform 0.5s linear");
					}, 10, target);

					setTimeout(function(t, x) {
						crossBrowserTransform(t, "translate(" + x + "px, 40px)");
						t.css({"opacity": "1.0"});
					}, 100, target, targetX);

				} else {
					crossBrowserTransform(target, "translateX(" + targetX + "px)");
				}
			}
		},
		addEnemy: function(creature) {
			this.enemies.push(creature);
		},
		addPlayer: function(creature) {
			this.players.push(creature);
		},
		showInitialMessage: function() {
			var name = null;
			var msg = "";
			for (var i = 0; i < this.enemies.length; i++) {
				if (name == null) {
					name = this.enemies[i].name;
				} else {
					if (name != this.enemies[i].name) {
						msg = "モンスターの群れが現れた！";
						break;
					}
				}
			}
			if (msg == "") {
				if (this.enemies.length == 1) {
					msg = name + "が現れた！";
				} else {
					msg = name + "達が現れた！";
				}
			}
			MessageWindow.prototype.push(msg);
		},
		onBattleCommand: function(e, command, selector) {
			switch (command) {
				case "ATTACK":
					CommandWindow.prototype.close();
					var cmd = new CommandObject(CommandObject.prototype.TYPE_ATTACK, selector);
					console.log(cmd);
					CommandWindow.prototype.setEnemySelectEvent(cmd);
					break;
				case "SKILL":
					break;
				case "DEFENCE":
					break;
				case "ITEM":
					break;
				case "MOVE":
					break;
				case "ESCAPE":
					break;
			}
		},
		addCommand: function(commandObject) {
			this.commands.push(commandObject);
		},
		onPlayerCommandSelectionEnd: function(e, bf) {
			CommandWindow.prototype.close();
			$(".player-status", ga).removeClass("highlight");
			MessageWindow.prototype.skip();

			// Enemy turn
			bf.setEnemyCommands();

			// Execute all action
			bf.executeAllAction();
		},
		setEnemyCommands: function() {
			for (var i = 0; i < this.enemies.length; i++) {
				var e = this.enemies[i];
				// Decide monster's command
				var cmd = e.decideCommand(this);
				this.commands.push(cmd);
			}
		},
		executeAllAction: function() {
			console.log(this);

			// Set command speed
			for (var i = 0; i < this.commands.length; i++) {
				var cmd = this.commands[i];
				var creature = cmd.creature;
				switch (cmd.type) {
					case CommandObject.prototype.TYPE_VOID:
					case CommandObject.prototype.TYPE_DEFENCE:
						cmd.speed = 9999;
						break;
					case CommandObject.prototype.TYPE_ATTACK:
					case CommandObject.prototype.TYPE_ITEM:
						cmd.speed = creature.ability.agi;
						break;
					case CommandObject.prototype.TYPE_SKILL:
						// TODO: change by skill
						cmd.speed = creature.ability.agi;
						break;
				}
			}
			// Sort by command speed
			this.commands.sort(function(a, b) {
				if (a.speed < b.speed) return 1;
				if (a.speed > b.speed) return -1;
				return 0;
			});

			console.log("sorted", this.commands);
		}
	};

	function Creature(){
		// Fields
		this.name = null;
		this.id = null;
		this.ability = {
			maxhp: 1,		maxtp: 1,
			str: 1,			tec: 1,
			vit: 1,			agi: 1,
			luc: 1
		}
		this.status = {
			hp: 1, tp: 1,
			bind: { head: false, arm: false, leg: false },
			bad: this.BAD_NORMAL
		};
		this.skills = {}
		this.image = null;
	}
	Creature.prototype = {
		// Consts
		BAD_NORMAL: 0,		BAD_STUNNED: 1,		BAD_BLIND: 2,
		BAD_PARALYZED: 3,	BAD_POISONED: 4,	BAD_SLEPT: 5,
		BAD_CONFUSION: 6,	BAD_CURSED: 7,		BAD_TERROR: 8,
		BAD_STONED: 9,		BAD_DEAD: 10,
		// Variables
		counter: 0,
		// Functions
		init: function(name, ability, image) {
			this.id = Creature.prototype.counter++;
			this.name = name;
			this.ability = ability;
			this.status.hp = this.ability.maxhp;
			this.status.tp = this.ability.maxtp;
			this.image = image;
		},
		decideCommand: function(bf) {
			// Override by each monster

			// Return CommandObject
			return new CommandObject(CommandObject.prototype.TYPE_ATTACK, this, [ null ]);
		}
	};

	function Skill() {
		this.name = "no name";
		this.tp = 1;
	}
	Skill.prototype = {
		// Consts
		CATEGORY_ACTIVE: 1,		CATEGORY_PASSIVE: 2,
		TARGET_ENEMY: 1,		TARGET_FRIEND: 2, 		TARGET_ALL: 3,
		TYPE_DAMAGE: 1, 		TYPE_SPECIAL: 2,
		SPECIAL_ATTACK_REINFORCE: 1, 	SPECIAL_ATTACK_WEAKEN: 2,
		SPECIAL_DEFENCE_REINFORCE: 3,	SPECIAL_DEFENCE_WEAKEN: 4,
		SPECIAL_SPEED_REINFORCE: 5,		SPECIAL_SPEED_WEAKEN: 6
	};

	function ImagePreLoader(){}
	ImagePreLoader.prototype = {
		counter: 0,
		callback: null,
		pl: null,
		load: function(pl, callback) {
			this.pl = pl;
			// Preload Images
			this.pl.append('<img src="./images/wm01117.jpg">');
			this.pl.append('<img src="./images/moa.png">');

			$("img", this.pl).bind("load", {loader: this}, this.onImageLoaded);
			this.callback = callback;
		},
		onImageLoaded: function(e) {
			var _this = e.data.loader;
			_this.counter++;
			if ($("img", _this.pl).length === _this.counter) {
				// Load Complete
				_this.callback();
			}
		}
	}

	function MessageWindow(){}
	MessageWindow.prototype = {
		defaultMessageSpeed: 1000,		// Message Speed (ms)
		messageElement: null,
		turnElement: null,
		queue: new Array(),
		init: function() {
			ga.append('<div class="message-window"><div class="value"></div></div>');
			ga.append('<div class="turn-window"><span class="label">TURN</span><span class="value">1</span></div>');
			this.messageElement = $(".message-window");
			this.turnElement = $(".turn-window");
		},
		push: function(str) {
			this.queue.push(str);
			this.refresh();
		},
		skip: function() {
			this.queue.shift();
			this.refresh();
		},
		refresh: function() {
			if (this.queue.length > 0) {
				this.setMessage(this.queue[0]);
			} else {
				this.setMessage("");
			}
		},
		setTurn: function(turn) {
			$(".value", this.turnElement).html(turn);
		},
		getTurn: function() {
			return parseInt($(".value", this.turnElement).html());
		},
		setHoverMessage: function(target, message) {
			target.bind("mouseenter", { _this: this, message: message }, this.MouseOverHandler);
			target.bind("mouseleave", { _this: this }, this.MouseOutHandler);
		},
		setMessage: function(message) {
			$(".value", this.messageElement).html(message);
		},
		MouseOverHandler: function(e) {
			e.data._this.setMessage(e.data.message);
		},
		MouseOutHandler: function(e) {
			e.data._this.refresh();
		}
	}

	function CommandWindow(){}
	CommandWindow.prototype = {
		rootCommands: [ "ATTACK", "SKILL", "DEFENCE", "ITEM", "MOVE", "ESCAPE" ],
		commandElement: null,
		battleField: null,
		commandSelectorIndex: null,
		init: function(bf) {
			var _this = this;
			this.battleField = bf;
			commandSelectorIndex = 0;

			ga.append('<div class="command-window"></div>');
			this.commandElement = $(".command-window");
			this.commandElement.append('<ul></ul>');
			this.commandElement.css({"visibility": "hidden"});

			// Root commands
			for (var i = 0; i < this.rootCommands.length; i++) {
				$("ul", this.commandElement).append("<li>" + this.rootCommands[i] + "</li>");
				var target = $("ul li:last-of-type", this.commandElement);
				var message = "";
				switch (this.rootCommands[i]) {
					case "ATTACK": 	message = "攻撃します"; break;
					case "SKILL": 	message = "技を使います"; break;
					case "DEFENCE": message = "防御します"; break;
					case "ITEM": 	message = "アイテムを使います(未実装)"; break;
					case "MOVE": 	message = "場所を移動します(未実装)"; break;
					case "ESCAPE": 	message = "逃走します(未実装)"; break;
				}
				// Set command description
				MessageWindow.prototype.setHoverMessage(target, message);
				// Select event trigger
				target.bind("click", { command: this.rootCommands[i] }, function(e) {
					var selector = _this.battleField.players[_this.commandSelectorIndex];
					ga.trigger("onBattleCommand", [ e.data.command, selector ] );
				});
			}

			this.close();
		},
		open: function() {
			// Show command window
			this.commandElement.css({"visibility": "visible"});
			crossBrowserTransform(this.commandElement, "translateX(0px)");	

			// Get command selector index
			this.commandSelectorIndex = this.battleField.commands.length;

			// Command selection end
			if (this.battleField.players.length == this.commandSelectorIndex) {
				ga.trigger('onPlayerCommandSelectionEnd', [ this.battleField ]);
				return;
			}

			// Highlight command selector
			var selector = this.battleField.players[this.commandSelectorIndex];
			if (this.isCommandSelectable(selector)) {
				// Highlight
				$(".player-status", ga).removeClass("highlight");
				$(".player-status[data-id=" + selector.id + "]", ga).addClass("highlight");
			} else {
				// Skip selection
				var command = new CommandObject(CommandObject.prototype.TYPE_VOID, selector);
				this.battleField.addCommand(command);
				this.open();
			}
		},
		isCommandSelectable: function(player) {
			// Check is player able to select command
			if (player.status.bad == Creature.prototype.BAD_CONFUSION ||
				player.status.bad == Creature.prototype.BAD_DEAD ||
				player.status.bad == Creature.prototype.BAD_STONED ||
				player.status.bad == Creature.prototype.BAD_SLEPT
				) {
				return false;
			}
			return true;
		},
		close: function() {
			var w = this.commandElement.width();
			crossBrowserTransform(this.commandElement, "translateX(-" + w + "px)");
		},
		setEnemySelectEvent: function(command) {
			var _this = this;

			// Back
			ga.unbind("rightclick");
			ga.bind("rightclick", function() {
				CommandWindow.prototype.open();

				$(".enemy-image", ga).unbind("mouseenter");
				$(".enemy-image", ga).unbind("mouseleave");
				MessageWindow.prototype.refresh();
				_this.hideEnemyStatus();
			});

			$(".enemy-image", ga).each(function() {
				var enemy = _this.getEnemyFromElement($(this));

				// Show enemy status
				$(this).unbind("mouseenter");
				$(this).unbind("mouseleave");
				MessageWindow.prototype.setHoverMessage($(this), enemy.name);
				$(this).bind("mouseenter", function() {
					_this.showEnemyStatus(this);
				});
				$(this).bind("mouseleave", function() {
					_this.hideEnemyStatus();
				});

				// Select event
				$(this).unbind("click");
				$(this).bind("click", { _enemy: enemy }, function(e) {
					command.args = [ e.data._enemy ];
					_this.battleField.addCommand(command);
					ga.trigger("rightclick");
				})
			});
			
		},
		getEnemyFromElement: function(element) {
			var id = $(element).attr("data-id");
			for (var i = 0; i < this.battleField.enemies.length; i++) {
				if (this.battleField.enemies[i].id == id) {
					return this.battleField.enemies[i];
				}
			}
			return null;
		},
		getElementFromEnemy: function(enemy) {
			return $(".enemy-image[data-id=" + enemy.id + "]", ga);
		},
		showEnemyStatus: function(target) {
			// target == null : Show all
			var id = $(target).attr("data-id");
			var showList = new Array();
			target = target == undefined ? null : target;

			// Reset
			this.hideEnemyStatus();

			// Show target
			for (var i = 0; i < this.battleField.enemies.length; i++) {
				if (this.battleField.enemies[i].id == id || target == null) {
					showList.push(this.battleField.enemies[i]);
				}
			}
			// Show
			for (var i = 0; i < showList.length; i++) {
				var e = showList[i];
				var element = this.getElementFromEnemy(e);
				element.append('<div class="enemy-status"><div class="container"><span class="label">HP</span><span class="bar"></span></div></div>');
				var last = $(".enemy-status:last-of-type", ga);
				last.css({
					"left": (element.width() / 2) - (last.width() / 2),
					"top": (element.height() / 2) - (last.height() / 2),
				});

				var per = (e.status.hp / e.ability.maxhp) * 74;
				$(".bar", last).css({"width": per + "%"});
			}
		},
		hideEnemyStatus: function() {
			$(".enemy-status", ga).remove();
		}
	}

	function CommandObject(type, creature, args, skill){
		this.type = type;
		this.creature = creature;
		this.args = (args == undefined) ? null : args;
		this.skill = (skill == undefined) ? null : skill;
	}
	CommandObject.prototype = {
		TYPE_VOID: 0,	// No action
		TYPE_ATTACK: 1,		TYPE_SKILL: 2,
		TYPE_DEFENCE: 3,	TYPE_ITEM: 4
	}

	/*
		Main
	*/

	$(function() {
		ga = $("#game-area");
		ga.bind("contextmenu", function(e) {
			e.preventDefault();
			ga.trigger("rightclick");
		});

		// Start after image preload
		var ipl = new ImagePreLoader();
		ipl.load($("#preloader"), function() {
			startBattle();

		});
	});

	function startBattle() {
		ga.empty();

		ga.append('<div class="blackout"></div>');
		ga.append('<div class="battle-bg"></div>');

		var bf = new BattleField();
		MessageWindow.prototype.init();
		CommandWindow.prototype.init(bf);

		var enemy = new Creature();
		var enemy2 = new Creature();
		enemy.init("ジャイアントモア",
			{maxhp: 1000, maxtp: 0, str: 35, tec: 22, vit: 44, agi: 25, luc: 36},
			"moa.png");
		enemy2.init("ジャイアントモア",
			{maxhp: 1000, maxtp: 0, str: 35, tec: 22, vit: 44, agi: 25, luc: 36},
			"moa.png");

		var player = new Creature();
		player.init("Player1",
			{maxhp: 250, maxtp: 40, str: 5, tec: 2, vit: 3, agi: 13, luc: 6},
			null);
		var player2 = new Creature();
		player2.init("Player2",
			{maxhp: 300, maxtp: 40, str: 5, tec: 2, vit: 3, agi: 7, luc: 6},
			null);
		var player3 = new Creature();
		player3.init("Player3",
			{maxhp: 150, maxtp: 60, str: 5, tec: 2, vit: 3, agi: 9, luc: 6},
			null);

		bf.addPlayer(player);
		bf.addPlayer(player2);
		bf.addPlayer(player3);
		bf.addEnemy(enemy);
		bf.addEnemy(enemy2);

		bf.init(1);

		startFadeout(500);
	}
	function startFadeout(time) {
		var target = $(".blackout", ga);
		crossBrowserTransition(target, "background " + time + "ms linear 0s");
		setTimeout(function() {
			target.css({ "background": "rgba(0,0,0, 0)" });
		}, 0);
		setTimeout(function() {
			target.css({ "display": "none" });
		}, time);
	}
	function crossBrowserTransition(target, value) {
		var prefix = "";
		if (target.get(0).style.WebkitTransition != undefined) {
			prefix = "webkit";
			value = value.replace(/PREFIX/, prefix);
			target.css({"-webkit-transition": value});
			value = value.replace("-" + prefix + "-", "");	// for Pure transition
		}
		if (target.get(0).style.MozTransition != undefined) {
			prefix = "moz";
			value = value.replace(/PREFIX/, prefix);
			target.css({"-moz-transition": value});
		}
		target.css({"transition": value});
	}
	function crossBrowserTransform(target, value) {
		if (target.get(0).style.WebkitTransition != undefined) {
			target.css({"-webkit-transform": value});
		}
		if (target.get(0).style.MozTransition != undefined) {
			target.css({"-moz-transform": value});
		}
		target.css({"transform": value});
	}

})(jQuery);
