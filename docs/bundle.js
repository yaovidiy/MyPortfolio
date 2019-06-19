
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }

    function createLang() {
    	const { subscribe, set, update } = writable('en');

    	return {
    		subscribe,
    		ua: () => set('ua'),
    		ru: () => set('ru'),
    		en: () => set('en'),
    		reset: () => set('en')
    	};
    }

    function createCurrPage(){
    	const { subscribe, set, update } = writable('home');

    	return {
    		subscribe,
    		home:(e)=>{
    			e.preventDefault();
    			set('home');},
    		about:(e)=>{
    			e.preventDefault();
    			set('about');},
    		projects:(e)=>{
    			e.preventDefault();
    			set('projects');},
    		contact:(e)=>{
    			e.preventDefault();
    			set('contact');}
    	}
    }

    const texts = writable({
    	menu:{
    		ru:{
    			logo:'YaOvdiy',
    			choosenLang:'Русский',
    			home:'Главная',
    			about:'Обо мне',
    			projects:'Проекты',
    			contact:'Контакты'
    		},
    		en:{
    			logo:'YaOvdiy',
    			choosenLang:'English',
    			home:'Home',
    			about:'About',
    			projects:'Projects',
    			contact:'Contact'
    		},
    		ua:{
    			logo:'YaOvdiy',
    			choosenLang:'Українська',
    			home:'Головна',
    			about:'Про мене',
    			projects:'Проекти',
    			contact:'Контакти'
    		}
    	},
    	home:{
    		welcom:{
    			en:["Hi there!", 
    				"Thanks for visit my resume, sort of:)",
    				"Here I would show, most if my skills",
    				"First of all",
    				"This site written using SVELTE",
    				"That's a first time I using it",
    				"Look around, maybe you will like it",
    				"Have a nice day!"
    			],
    			ua:[
    				"Доброго дня!",
    				"Дякую що завітали до мого резюме",
    				"Тут я покажу більшість свої вмінь",
    				"Спершу",
    				"Цей сайт зроблений з використанням SVELTE",
    				"Це перший мій проект на ньому",
    				"Погляньте що тут є, можливо Вам щось сподобається",
    				"Всього Вам на кращего!"
    			],
    			ru:[
    				"Добрый день!",
    				"Спасибо что посетили мое резюме",
    				"Тут я покажу большенство своих умений",
    				"Сначала",
    				"Этот сайт был сделан с использованием SVELTE",
    				"Это мой первый проект на нем",
    				"Осмотритесь тут, может найдете что то интересно для Вас",
    				"Хорошего Вам дня!"
    			]
    		},
    		subText:{
    			en:"I'm not a disigner, so don't be judging :)",
    			ua:'Я не дизайнер, тому не судь строго :)',
    			ru:'Я не дизайнер, поэтому не судите строго :)'
    		},
    		works:{
    			en:'My works',
    			ua:'Мої роботи',
    			ru:'Мои работы'
    		},
    		resume:{
    			en:'My resume',
    			ua:'Моє резюме',
    			ru:'Мое резюме',
    		}
    	},
    	about:{
    		text:{
    			en:`<p>
					Okey, little information about me.
				</p>
				<p>
					My name is Yaroslav. I worked in Obliksoft company on position of the junior front-end.
					<br>
					I worked there for 10 month
					<br>
					I started as there as junior specialist, and supported already exsiting projects written on JavaScript
					and REST API.
					<br>
					At the end of my time there I was creating my own apps for Bitrix24 platform using already React/Redux 
					and Webpack for compiling projects
				</p>`,
    			ua:`<p>
					Ну що, трохи інформації про мене.
				</p>
				<p>
					Моє ім'я Ярослав. Я працював в компанії Обліксофт на позиції  junior front-end.
					<br>
					Я пропрацював там 10 місяців
					<br>
					Я починав як молодший спеціаліст та підтримував вже існуючі проекти написанні на JavaScript та 
					з використанням REST API.
					<br>
					Під кінець своєї роботи в компанії я вже розробляв свої застосунки для платформи Bitrix24 використовуючи
					React/Redux та Webpack для компіляції проектів
				</p>`,
    			ru:`<p>
					Okey, little information about me.
				</p>
				<p>
					My name is Yaroslav. I worked in Obliksoft company on position of the junior front-end.
					<br>
					I worked there for 10 month
					<br>
					I started as there as junior specialist, and supported already exsiting projects written on JavaScript
					and REST API.
					<br>
					At the end of my time there I was creating my own apps for Bitrix platform using already React/Redux 
					and Webpack for compiling projects
				</p>`,
    		},
    		cv:{
    			ru:'Скачать резюме',
    			en:'Download my CV',
    			ua:'Завантажити резюме',
    		},
    		projects:{
    			ru:'Посмотрите мои работы',
    			ua:'Подивіться мої роботи',
    			en:'Look for my work',
    		}


    	}
    });

    const lang = createLang();

    const currPage = createCurrPage();

    /* src\menu.svelte generated by Svelte v3.5.1 */

    const file = "src\\menu.svelte";

    // (175:12) {:else }
    function create_else_block_2(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-bars";
    			add_location(i, file, 175, 16, 3346);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (173:12) {#if openedMenu}
    function create_if_block_2(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-times";
    			add_location(i, file, 173, 16, 3278);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (199:24) {:else}
    function create_else_block_1(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-angle-down";
    			add_location(i, file, 199, 28, 4727);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (197:24) {#if openedLang}
    function create_if_block_1(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-angle-up";
    			add_location(i, file, 197, 28, 4633);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (243:24) {:else}
    function create_else_block(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-angle-down";
    			add_location(i, file, 243, 28, 6949);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (241:24) {#if openedLang}
    function create_if_block(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-angle-up";
    			add_location(i, file, 241, 28, 6855);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	var nav, div0, t1, div3, a0, t2, div2, ul1, li0, a1, t3_value = ctx.$texts.menu[ctx.$lang].home, t3, t4, li1, a2, t5_value = ctx.$texts.menu[ctx.$lang].about, t5, t6, li2, a3, t7_value = ctx.$texts.menu[ctx.$lang].projects, t7, t8, li3, a4, t9_value = ctx.$texts.menu[ctx.$lang].contact, t9, t10, li7, a5, t11_value = ctx.$texts.menu[ctx.$lang].choosenLang, t11, t12, span0, t13, div1, ul0, li4, a6, t15, li5, a7, t17, li6, a8, t19, div5, ul3, li8, a9, t20_value = ctx.$texts.menu[ctx.$lang].home, t20, t21, li9, a10, t22_value = ctx.$texts.menu[ctx.$lang].about, t22, t23, li10, a11, t24_value = ctx.$texts.menu[ctx.$lang].projects, t24, t25, li11, a12, t26_value = ctx.$texts.menu[ctx.$lang].contact, t26, t27, li15, a13, t28_value = ctx.$texts.menu[ctx.$lang].choosenLang, t28, t29, span1, t30, div4, ul2, li12, a14, t32, li13, a15, t34, li14, a16, dispose;

    	function select_block_type(ctx) {
    		if (ctx.openedMenu) return create_if_block_2;
    		return create_else_block_2;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx) {
    		if (ctx.openedLang) return create_if_block_1;
    		return create_else_block_1;
    	}

    	var current_block_type_1 = select_block_type_1(ctx);
    	var if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx) {
    		if (ctx.openedLang) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type_2 = select_block_type_2(ctx);
    	var if_block2 = current_block_type_2(ctx);

    	return {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			div0.textContent = "YaOvdiy";
    			t1 = space();
    			div3 = element("div");
    			a0 = element("a");
    			if_block0.c();
    			t2 = space();
    			div2 = element("div");
    			ul1 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t3 = text(t3_value);
    			t4 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			t7 = text(t7_value);
    			t8 = space();
    			li3 = element("li");
    			a4 = element("a");
    			t9 = text(t9_value);
    			t10 = space();
    			li7 = element("li");
    			a5 = element("a");
    			t11 = text(t11_value);
    			t12 = space();
    			span0 = element("span");
    			if_block1.c();
    			t13 = space();
    			div1 = element("div");
    			ul0 = element("ul");
    			li4 = element("li");
    			a6 = element("a");
    			a6.textContent = "English";
    			t15 = space();
    			li5 = element("li");
    			a7 = element("a");
    			a7.textContent = "Українська";
    			t17 = space();
    			li6 = element("li");
    			a8 = element("a");
    			a8.textContent = "Русский";
    			t19 = space();
    			div5 = element("div");
    			ul3 = element("ul");
    			li8 = element("li");
    			a9 = element("a");
    			t20 = text(t20_value);
    			t21 = space();
    			li9 = element("li");
    			a10 = element("a");
    			t22 = text(t22_value);
    			t23 = space();
    			li10 = element("li");
    			a11 = element("a");
    			t24 = text(t24_value);
    			t25 = space();
    			li11 = element("li");
    			a12 = element("a");
    			t26 = text(t26_value);
    			t27 = space();
    			li15 = element("li");
    			a13 = element("a");
    			t28 = text(t28_value);
    			t29 = space();
    			span1 = element("span");
    			if_block2.c();
    			t30 = space();
    			div4 = element("div");
    			ul2 = element("ul");
    			li12 = element("li");
    			a14 = element("a");
    			a14.textContent = "English";
    			t32 = space();
    			li13 = element("li");
    			a15 = element("a");
    			a15.textContent = "Українська";
    			t34 = space();
    			li14 = element("li");
    			a16 = element("a");
    			a16.textContent = "Русский";
    			div0.className = "logo svelte-vy3gph";
    			add_location(div0, file, 167, 4, 3088);
    			a0.href = "#";
    			a0.className = "toogle-menu svelte-vy3gph";
    			add_location(a0, file, 171, 8, 3176);
    			a1.href = "#";
    			a1.className = "svelte-vy3gph";
    			add_location(a1, file, 182, 20, 3624);
    			li0.className = "menu-mobile-item svelte-vy3gph";
    			toggle_class(li0, "active-mobile", ctx.$currPage === 'home');
    			add_location(li0, file, 181, 16, 3528);
    			a2.href = "#";
    			a2.className = "svelte-vy3gph";
    			add_location(a2, file, 185, 20, 3828);
    			li1.className = "menu-mobile-item svelte-vy3gph";
    			toggle_class(li1, "active-mobile", ctx.$currPage === 'about');
    			add_location(li1, file, 184, 16, 3731);
    			a3.href = "#";
    			a3.className = "svelte-vy3gph";
    			add_location(a3, file, 188, 20, 4037);
    			li2.className = "menu-mobile-item svelte-vy3gph";
    			toggle_class(li2, "active-mobile", ctx.$currPage === 'projects');
    			add_location(li2, file, 187, 16, 3937);
    			a4.href = "#";
    			a4.className = "svelte-vy3gph";
    			add_location(a4, file, 191, 20, 4251);
    			li3.className = "menu-mobile-item svelte-vy3gph";
    			toggle_class(li3, "active-mobile", ctx.$currPage === 'contact');
    			add_location(li3, file, 190, 16, 4152);
    			span0.className = "open-lang svelte-vy3gph";
    			add_location(span0, file, 195, 20, 4483);
    			a5.href = "#";
    			a5.className = "svelte-vy3gph";
    			add_location(a5, file, 194, 20, 4416);
    			a6.href = "#";
    			a6.className = "svelte-vy3gph";
    			add_location(a6, file, 205, 36, 5030);
    			li4.className = "accordion-item svelte-vy3gph";
    			add_location(li4, file, 204, 32, 4965);
    			a7.href = "#";
    			a7.className = "svelte-vy3gph";
    			add_location(a7, file, 208, 36, 5210);
    			li5.className = "accordion-item svelte-vy3gph";
    			add_location(li5, file, 207, 32, 5145);
    			a8.href = "#";
    			a8.className = "svelte-vy3gph";
    			add_location(a8, file, 211, 36, 5393);
    			li6.className = "accordion-item svelte-vy3gph";
    			add_location(li6, file, 210, 32, 5328);
    			ul0.className = "accordion-list svelte-vy3gph";
    			add_location(ul0, file, 203, 28, 4904);
    			div1.className = "accordion svelte-vy3gph";
    			add_location(div1, file, 202, 24, 4851);
    			li7.className = "menu-mobile-item svelte-vy3gph";
    			add_location(li7, file, 193, 16, 4364);
    			ul1.className = "menu-mobile-items svelte-vy3gph";
    			add_location(ul1, file, 180, 12, 3480);
    			div2.className = "menu-mobile-background svelte-vy3gph";
    			add_location(div2, file, 179, 8, 3430);
    			div3.className = "menu-mobile svelte-vy3gph";
    			add_location(div3, file, 170, 4, 3141);
    			a9.href = "#";
    			a9.className = "svelte-vy3gph";
    			toggle_class(a9, "active-desktop", ctx.$currPage === 'home');
    			add_location(a9, file, 222, 16, 5747);
    			li8.className = "menu-desktop-item svelte-vy3gph";
    			add_location(li8, file, 221, 12, 5698);
    			a10.href = "#";
    			a10.className = "svelte-vy3gph";
    			toggle_class(a10, "active-desktop", ctx.$currPage === 'about');
    			add_location(a10, file, 226, 16, 5959);
    			li9.className = "menu-desktop-item svelte-vy3gph";
    			add_location(li9, file, 225, 12, 5910);
    			a11.href = "#";
    			a11.className = "svelte-vy3gph";
    			toggle_class(a11, "active-desktop", ctx.$currPage === 'projects');
    			add_location(a11, file, 230, 16, 6174);
    			li10.className = "menu-desktop-item svelte-vy3gph";
    			add_location(li10, file, 229, 12, 6125);
    			a12.href = "#";
    			a12.className = "svelte-vy3gph";
    			toggle_class(a12, "active-desktop", ctx.$currPage === 'contact');
    			add_location(a12, file, 234, 16, 6399);
    			li11.className = "menu-desktop-item svelte-vy3gph";
    			add_location(li11, file, 233, 12, 6350);
    			span1.className = "open-lang_lg svelte-vy3gph";
    			add_location(span1, file, 239, 20, 6694);
    			a13.href = "#";
    			a13.className = "svelte-vy3gph";
    			add_location(a13, file, 238, 16, 6628);
    			a14.href = "#";
    			a14.className = "svelte-vy3gph";
    			add_location(a14, file, 250, 28, 7242);
    			li12.className = "dropdown-item svelte-vy3gph";
    			add_location(li12, file, 249, 24, 7186);
    			a15.href = "#";
    			a15.className = "svelte-vy3gph";
    			add_location(a15, file, 253, 28, 7397);
    			li13.className = "dropdown-item svelte-vy3gph";
    			add_location(li13, file, 252, 24, 7341);
    			a16.href = "#";
    			a16.className = "svelte-vy3gph";
    			add_location(a16, file, 256, 28, 7555);
    			li14.className = "dropdown-item svelte-vy3gph";
    			add_location(li14, file, 255, 24, 7499);
    			ul2.className = "dropdown-list svelte-vy3gph";
    			add_location(ul2, file, 248, 20, 7134);
    			div4.className = "dropdown-content svelte-vy3gph";
    			add_location(div4, file, 247, 16, 7082);
    			li15.className = "menu-desktop-item dropdown svelte-vy3gph";
    			add_location(li15, file, 237, 12, 6571);
    			ul3.className = "menu-desktop-items svelte-vy3gph";
    			add_location(ul3, file, 220, 8, 5653);
    			div5.className = "menu-desktop svelte-vy3gph";
    			add_location(div5, file, 219, 4, 5617);
    			nav.className = "main-menu container svelte-vy3gph";
    			add_location(nav, file, 166, 0, 3049);

    			dispose = [
    				listen(a0, "click", ctx.toogleMenu),
    				listen(a1, "click", currPage.home),
    				listen(a2, "click", currPage.about),
    				listen(a3, "click", currPage.projects),
    				listen(a4, "click", currPage.contact),
    				listen(span0, "click", ctx.toogleLang.bind(null,'accordion','height')),
    				listen(a6, "click", lang.en),
    				listen(a7, "click", lang.ua),
    				listen(a8, "click", lang.ru),
    				listen(a9, "click", currPage.home),
    				listen(a10, "click", currPage.about),
    				listen(a11, "click", currPage.projects),
    				listen(a12, "click", currPage.contact),
    				listen(span1, "click", ctx.toogleLang.bind(null,'dropdown-content','display')),
    				listen(a14, "click", lang.en),
    				listen(a15, "click", lang.ua),
    				listen(a16, "click", lang.ru)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, div0);
    			append(nav, t1);
    			append(nav, div3);
    			append(div3, a0);
    			if_block0.m(a0, null);
    			append(div3, t2);
    			append(div3, div2);
    			append(div2, ul1);
    			append(ul1, li0);
    			append(li0, a1);
    			append(a1, t3);
    			append(ul1, t4);
    			append(ul1, li1);
    			append(li1, a2);
    			append(a2, t5);
    			append(ul1, t6);
    			append(ul1, li2);
    			append(li2, a3);
    			append(a3, t7);
    			append(ul1, t8);
    			append(ul1, li3);
    			append(li3, a4);
    			append(a4, t9);
    			append(ul1, t10);
    			append(ul1, li7);
    			append(li7, a5);
    			append(a5, t11);
    			append(a5, t12);
    			append(a5, span0);
    			if_block1.m(span0, null);
    			append(li7, t13);
    			append(li7, div1);
    			append(div1, ul0);
    			append(ul0, li4);
    			append(li4, a6);
    			append(ul0, t15);
    			append(ul0, li5);
    			append(li5, a7);
    			append(ul0, t17);
    			append(ul0, li6);
    			append(li6, a8);
    			append(nav, t19);
    			append(nav, div5);
    			append(div5, ul3);
    			append(ul3, li8);
    			append(li8, a9);
    			append(a9, t20);
    			append(ul3, t21);
    			append(ul3, li9);
    			append(li9, a10);
    			append(a10, t22);
    			append(ul3, t23);
    			append(ul3, li10);
    			append(li10, a11);
    			append(a11, t24);
    			append(ul3, t25);
    			append(ul3, li11);
    			append(li11, a12);
    			append(a12, t26);
    			append(ul3, t27);
    			append(ul3, li15);
    			append(li15, a13);
    			append(a13, t28);
    			append(a13, t29);
    			append(a13, span1);
    			if_block2.m(span1, null);
    			append(li15, t30);
    			append(li15, div4);
    			append(div4, ul2);
    			append(ul2, li12);
    			append(li12, a14);
    			append(ul2, t32);
    			append(ul2, li13);
    			append(li13, a15);
    			append(ul2, t34);
    			append(ul2, li14);
    			append(li14, a16);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(a0, null);
    				}
    			}

    			if ((changed.$texts || changed.$lang) && t3_value !== (t3_value = ctx.$texts.menu[ctx.$lang].home)) {
    				set_data(t3, t3_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(li0, "active-mobile", ctx.$currPage === 'home');
    			}

    			if ((changed.$texts || changed.$lang) && t5_value !== (t5_value = ctx.$texts.menu[ctx.$lang].about)) {
    				set_data(t5, t5_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(li1, "active-mobile", ctx.$currPage === 'about');
    			}

    			if ((changed.$texts || changed.$lang) && t7_value !== (t7_value = ctx.$texts.menu[ctx.$lang].projects)) {
    				set_data(t7, t7_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(li2, "active-mobile", ctx.$currPage === 'projects');
    			}

    			if ((changed.$texts || changed.$lang) && t9_value !== (t9_value = ctx.$texts.menu[ctx.$lang].contact)) {
    				set_data(t9, t9_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(li3, "active-mobile", ctx.$currPage === 'contact');
    			}

    			if ((changed.$texts || changed.$lang) && t11_value !== (t11_value = ctx.$texts.menu[ctx.$lang].choosenLang)) {
    				set_data(t11, t11_value);
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(span0, null);
    				}
    			}

    			if ((changed.$texts || changed.$lang) && t20_value !== (t20_value = ctx.$texts.menu[ctx.$lang].home)) {
    				set_data(t20, t20_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(a9, "active-desktop", ctx.$currPage === 'home');
    			}

    			if ((changed.$texts || changed.$lang) && t22_value !== (t22_value = ctx.$texts.menu[ctx.$lang].about)) {
    				set_data(t22, t22_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(a10, "active-desktop", ctx.$currPage === 'about');
    			}

    			if ((changed.$texts || changed.$lang) && t24_value !== (t24_value = ctx.$texts.menu[ctx.$lang].projects)) {
    				set_data(t24, t24_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(a11, "active-desktop", ctx.$currPage === 'projects');
    			}

    			if ((changed.$texts || changed.$lang) && t26_value !== (t26_value = ctx.$texts.menu[ctx.$lang].contact)) {
    				set_data(t26, t26_value);
    			}

    			if (changed.$currPage) {
    				toggle_class(a12, "active-desktop", ctx.$currPage === 'contact');
    			}

    			if ((changed.$texts || changed.$lang) && t28_value !== (t28_value = ctx.$texts.menu[ctx.$lang].choosenLang)) {
    				set_data(t28, t28_value);
    			}

    			if (current_block_type_2 !== (current_block_type_2 = select_block_type_2(ctx))) {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);
    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(span1, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $currPage, $texts, $lang;

    	validate_store(currPage, 'currPage');
    	subscribe($$self, currPage, $$value => { $currPage = $$value; $$invalidate('$currPage', $currPage); });
    	validate_store(texts, 'texts');
    	subscribe($$self, texts, $$value => { $texts = $$value; $$invalidate('$texts', $texts); });
    	validate_store(lang, 'lang');
    	subscribe($$self, lang, $$value => { $lang = $$value; $$invalidate('$lang', $lang); });

    	let openedMenu = false;
    let openedLang = false;


    function toogleMenu(){
        let menu = document.querySelector(".menu-mobile-background");
        let toogle = document.querySelector(".toogle-menu");
        if (!openedMenu){
            menu.style.display = 'flex';
            toogle.style.color = '#fff';
        }
        else{
            menu.style.display = 'none';
            toogle.style.color = '#000';
        }
        $$invalidate('openedMenu', openedMenu = !openedMenu);
    }

    console.log($currPage);

    function toogleLang (elem,attr,g=false){
        let accordion = document.querySelector(`.${elem}`);
        if ( !openedLang ){
            accordion.style[attr] = (attr==='display')?'block':'auto';
        }
        else{
            accordion.style[attr] = (attr==='display')?'none':'0px';
        }
        $$invalidate('openedLang', openedLang = !openedLang);

    }

    	return {
    		openedMenu,
    		openedLang,
    		toogleMenu,
    		toogleLang,
    		$currPage,
    		$texts,
    		$lang
    	};
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\home.svelte generated by Svelte v3.5.1 */

    const file$1 = "src\\home.svelte";

    function create_fragment$1(ctx) {
    	var section, div2, div0, h1, t0, span, t1_value = ctx.$texts.home.subText[ctx.$lang], t1, t2, div1, button0, t3_value = ctx.$texts.home.works[ctx.$lang], t3, t4, button1, t5_value = ctx.$texts.home.resume[ctx.$lang], t5;

    	return {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			button0 = element("button");
    			t3 = text(t3_value);
    			t4 = space();
    			button1 = element("button");
    			t5 = text(t5_value);
    			h1.id = "typing";
    			h1.className = "svelte-reus0b";
    			add_location(h1, file$1, 59, 12, 1726);
    			span.className = "small-text";
    			add_location(span, file$1, 60, 12, 1761);
    			div0.className = "col-12 d-flex flex-column align-items-center";
    			add_location(div0, file$1, 58, 8, 1654);
    			button0.className = "btn btn-outline-primary mb-2 mt-2";
    			add_location(button0, file$1, 63, 12, 1919);
    			button1.className = "btn btn-primary";
    			add_location(button1, file$1, 64, 12, 2018);
    			div1.className = "col-12 d-flex flex-column align-items-center";
    			add_location(div1, file$1, 62, 8, 1847);
    			div2.className = "row";
    			add_location(div2, file$1, 57, 4, 1627);
    			section.className = "container home svelte-reus0b";
    			add_location(section, file$1, 56, 0, 1589);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, div2);
    			append(div2, div0);
    			append(div0, h1);
    			append(div0, t0);
    			append(div0, span);
    			append(span, t1);
    			append(div2, t2);
    			append(div2, div1);
    			append(div1, button0);
    			append(button0, t3);
    			append(div1, t4);
    			append(div1, button1);
    			append(button1, t5);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$texts || changed.$lang) && t1_value !== (t1_value = ctx.$texts.home.subText[ctx.$lang])) {
    				set_data(t1, t1_value);
    			}

    			if ((changed.$texts || changed.$lang) && t3_value !== (t3_value = ctx.$texts.home.works[ctx.$lang])) {
    				set_data(t3, t3_value);
    			}

    			if ((changed.$texts || changed.$lang) && t5_value !== (t5_value = ctx.$texts.home.resume[ctx.$lang])) {
    				set_data(t5, t5_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $currPage, $texts, $lang;

    	validate_store(currPage, 'currPage');
    	subscribe($$self, currPage, $$value => { $currPage = $$value; $$invalidate('$currPage', $currPage); });
    	validate_store(texts, 'texts');
    	subscribe($$self, texts, $$value => { $texts = $$value; $$invalidate('$texts', $texts); });
    	validate_store(lang, 'lang');
    	subscribe($$self, lang, $$value => { $lang = $$value; $$invalidate('$lang', $lang); });

    	
        

        onMount(()=>{
            let currText = 0, textPos = 0;

            
            function typing(text, pos){
                console.log("get here");
                if ( $currPage === 'home' ){
                    let getText = $texts.home.welcom[$lang][text];
                    let allTexts = $texts.home.welcom[$lang];
                    let input = document.querySelector("#typing");
                    if ( getText.length > pos ){
                        input.innerHTML += getText[pos];
                        pos++;
                        setTimeout(() => {
                            typing(text, pos);                    
                        }, 50);
                    }
                    else if ( (allTexts.length - 1) > text ){
                        pos = 0;
                        text++;
                        setTimeout(() => {
                            input.innerHTML = '';
                            typing(text,pos);                    
                        }, 1000);
                    }
                    else{
                        input.innerHTML = `${$texts.home.welcom[$lang][text]}`;
                        console.log("all printed", text, pos, allTexts, getText);
                    }
                }
            }
            typing(currText, textPos);

        });

    	return { $texts, $lang };
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src\about.svelte generated by Svelte v3.5.1 */

    const file$2 = "src\\about.svelte";

    function create_fragment$2(ctx) {
    	var section, div5, div1, div0, img, t0, div4, div2, raw_value = ctx.$texts.about.text[ctx.$lang], t1, div3, button0, t2_value = ctx.$texts.about.cv[ctx.$lang], t2, t3, button1, t4_value = ctx.$texts.about.projects[ctx.$lang], t4;

    	return {
    		c: function create() {
    			section = element("section");
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div4 = element("div");
    			div2 = element("div");
    			t1 = space();
    			div3 = element("div");
    			button0 = element("button");
    			t2 = text(t2_value);
    			t3 = space();
    			button1 = element("button");
    			t4 = text(t4_value);
    			img.src = "newPhoto.jpg";
    			img.alt = "MyPhoto";
    			img.className = "svelte-xo2xko";
    			add_location(img, file$2, 15, 16, 398);
    			div0.className = "photo svelte-xo2xko";
    			add_location(div0, file$2, 14, 12, 361);
    			div1.className = "col-sm-3 col-md-3 col-xs-12";
    			add_location(div1, file$2, 13, 8, 306);
    			div2.className = "abput-text";
    			add_location(div2, file$2, 19, 12, 544);
    			button0.className = "btn btn-outline-primary mr-2 col-sm-12 col-md-4";
    			add_location(button0, file$2, 23, 16, 690);
    			button1.className = "btn btn-primary col-sm-12 col-md-4";
    			add_location(button1, file$2, 24, 16, 805);
    			div3.className = "col-12";
    			add_location(div3, file$2, 22, 12, 652);
    			div4.className = "col-sm-9 col-md-9 col-xs-12 mt-2";
    			add_location(div4, file$2, 18, 8, 484);
    			div5.className = "row justify-content-center align-items-center";
    			add_location(div5, file$2, 12, 4, 237);
    			section.id = "about";
    			section.className = "container mt-5";
    			add_location(section, file$2, 11, 0, 188);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, div5);
    			append(div5, div1);
    			append(div1, div0);
    			append(div0, img);
    			append(div5, t0);
    			append(div5, div4);
    			append(div4, div2);
    			div2.innerHTML = raw_value;
    			append(div4, t1);
    			append(div4, div3);
    			append(div3, button0);
    			append(button0, t2);
    			append(div3, t3);
    			append(div3, button1);
    			append(button1, t4);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$texts || changed.$lang) && raw_value !== (raw_value = ctx.$texts.about.text[ctx.$lang])) {
    				div2.innerHTML = raw_value;
    			}

    			if ((changed.$texts || changed.$lang) && t2_value !== (t2_value = ctx.$texts.about.cv[ctx.$lang])) {
    				set_data(t2, t2_value);
    			}

    			if ((changed.$texts || changed.$lang) && t4_value !== (t4_value = ctx.$texts.about.projects[ctx.$lang])) {
    				set_data(t4, t4_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $texts, $lang;

    	validate_store(texts, 'texts');
    	subscribe($$self, texts, $$value => { $texts = $$value; $$invalidate('$texts', $texts); });
    	validate_store(lang, 'lang');
    	subscribe($$self, lang, $$value => { $lang = $$value; $$invalidate('$lang', $lang); });

    	return { $texts, $lang };
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src\contacts.svelte generated by Svelte v3.5.1 */

    const file$3 = "src\\contacts.svelte";

    function create_fragment$3(ctx) {
    	var section, div10, div9, div2, div0, t1, div1, t3, div5, div3, t5, div4, t7, div8, div6, t9, div7;

    	return {
    		c: function create() {
    			section = element("section");
    			div10 = element("div");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "email:";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "YaOvdiy@gmail.com";
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "mobile:";
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "+38 066 605 24 87";
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			div6.textContent = "mobile:";
    			t9 = space();
    			div7 = element("div");
    			div7.textContent = "+38 068 ... .. ..";
    			div0.className = "col-4 type svelte-1l63ezv";
    			add_location(div0, file$3, 20, 16, 570);
    			div1.className = "col-8 value svelte-1l63ezv";
    			add_location(div1, file$3, 23, 16, 664);
    			div2.className = "row";
    			add_location(div2, file$3, 19, 12, 535);
    			div3.className = "col-4";
    			add_location(div3, file$3, 28, 16, 821);
    			div4.className = "col-8";
    			add_location(div4, file$3, 31, 16, 911);
    			div5.className = "row";
    			add_location(div5, file$3, 27, 12, 786);
    			div6.className = "col-4 text-center";
    			add_location(div6, file$3, 36, 16, 1062);
    			div7.className = "col-8";
    			add_location(div7, file$3, 39, 16, 1164);
    			div8.className = "row";
    			add_location(div8, file$3, 35, 12, 1027);
    			div9.className = "col-12 d-flex flex-column justify-content-center align-items-center text-center";
    			add_location(div9, file$3, 18, 8, 428);
    			div10.className = "row justify-content-center align-items-center text-center";
    			add_location(div10, file$3, 17, 4, 347);
    			section.id = "contact";
    			section.className = "container";
    			add_location(section, file$3, 16, 0, 301);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, section, anchor);
    			append(section, div10);
    			append(div10, div9);
    			append(div9, div2);
    			append(div2, div0);
    			append(div2, t1);
    			append(div2, div1);
    			append(div9, t3);
    			append(div9, div5);
    			append(div5, div3);
    			append(div5, t5);
    			append(div5, div4);
    			append(div9, t7);
    			append(div9, div8);
    			append(div8, div6);
    			append(div8, t9);
    			append(div8, div7);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(section);
    			}
    		}
    	};
    }

    class Contacts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.5.1 */

    const file$4 = "src\\App.svelte";

    // (20:34) 
    function create_if_block_2$1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = Contacts;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = Contacts)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    // (18:32) 
    function create_if_block_1$1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = About;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = About)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    // (16:0) {#if $currPage === 'home'}
    function create_if_block$1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_value = Home;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = Home)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$4(ctx) {
    	var link0, link1, t0, t1, current_block_type_index, if_block, if_block_anchor, current;

    	var switch_value = Menu;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	var if_block_creators = [
    		create_if_block$1,
    		create_if_block_1$1,
    		create_if_block_2$1
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.$currPage === 'home') return 0;
    		if (ctx.$currPage === 'about') return 1;
    		if (ctx.$currPage === 'contact') return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	return {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			if (switch_instance) switch_instance.$$.fragment.c();
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			link0.rel = "stylesheet";
    			link0.href = "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css";
    			attr(link0, "integrity", "sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T");
    			attr(link0, "crossorigin", "anonymous");
    			add_location(link0, file$4, 11, 1, 282);
    			link1.rel = "stylesheet";
    			link1.href = "https://use.fontawesome.com/releases/v5.6.1/css/all.css";
    			add_location(link1, file$4, 12, 1, 495);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			append(document.head, link0);
    			append(document.head, link1);
    			insert(target, t0, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, t1, anchor);
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = Menu)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, t1.parentNode, t1);
    				} else {
    					switch_instance = null;
    				}
    			}

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				if (if_block) {
    					group_outros();
    					on_outro(() => {
    						if_blocks[previous_block_index].d(1);
    						if_blocks[previous_block_index] = null;
    					});
    					if_block.o(1);
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			detach(link0);
    			detach(link1);

    			if (detaching) {
    				detach(t0);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $currPage;

    	validate_store(currPage, 'currPage');
    	subscribe($$self, currPage, $$value => { $currPage = $$value; $$invalidate('$currPage', $currPage); });

    	

    	let { name } = $$props;

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	return { name, $currPage };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["name"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
