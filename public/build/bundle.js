
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
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
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
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
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
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
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/LessonEdit.svelte generated by Svelte v3.19.1 */

    const file = "src/components/LessonEdit.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (102:14) {#each CATEGORY_TYPES as type}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[20] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[20];
    			option.value = option.__value;
    			add_location(option, file, 102, 16, 2886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(102:14) {#each CATEGORY_TYPES as type}",
    		ctx
    	});

    	return block;
    }

    // (136:14) {#each DIFFICULTY_TYPES as type}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[20] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[20];
    			option.value = option.__value;
    			add_location(option, file, 136, 16, 4150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(136:14) {#each DIFFICULTY_TYPES as type}",
    		ctx
    	});

    	return block;
    }

    // (156:8) {#if lesson.category == 'general'}
    function create_if_block_2(ctx) {
    	let div;
    	let label;
    	let t1;
    	let textarea;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "General Steps";
    			t1 = space();
    			textarea = element("textarea");
    			attr_dev(label, "for", "typeSteps");
    			attr_dev(label, "class", "text-gray-700 text-sm font-bold");
    			add_location(label, file, 157, 12, 4826);
    			attr_dev(textarea, "class", "shadow appearance-none border rounded w-full py-2 px-3\n              text-gray-700 leading-tight focus:outline-none\n              focus:shadow-outline");
    			attr_dev(textarea, "id", "typeSteps");
    			attr_dev(textarea, "rows", "5");
    			add_location(textarea, file, 160, 12, 4951);
    			attr_dev(div, "class", "mb-4");
    			add_location(div, file, 156, 10, 4795);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, textarea);
    			dispose = listen_dev(textarea, "input", /*typingLesson*/ ctx[4], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(156:8) {#if lesson.category == 'general'}",
    		ctx
    	});

    	return block;
    }

    // (173:8) {#if lesson.category == 'html-css'}
    function create_if_block(ctx) {
    	let button;
    	let t1;
    	let hr;
    	let t2;
    	let if_block_anchor;
    	let dispose;
    	let if_block = /*lesson*/ ctx[0].steps.length && typeof /*lesson*/ ctx[0].steps[0] == "object" && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Add New Step";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button, "class", "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4\n            rounded w-full");
    			add_location(button, file, 173, 10, 5380);
    			attr_dev(hr, "class", "my-2");
    			add_location(hr, file, 179, 10, 5583);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			dispose = listen_dev(button, "click", /*addStep*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (/*lesson*/ ctx[0].steps.length && typeof /*lesson*/ ctx[0].steps[0] == "object") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(173:8) {#if lesson.category == 'html-css'}",
    		ctx
    	});

    	return block;
    }

    // (182:10) {#if lesson.steps.length && typeof lesson.steps[0] == 'object'}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value = /*lesson*/ ctx[0].steps;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*removeStep, codeLesson, lesson, LESSON_TYPES*/ 169) {
    				each_value = /*lesson*/ ctx[0].steps;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(182:10) {#if lesson.steps.length && typeof lesson.steps[0] == 'object'}",
    		ctx
    	});

    	return block;
    }

    // (200:22) {#each LESSON_TYPES as type}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[20] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[20];
    			option.value = option.__value;
    			add_location(option, file, 200, 24, 6551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(200:22) {#each LESSON_TYPES as type}",
    		ctx
    	});

    	return block;
    }

    // (183:12) {#each lesson.steps as step, i}
    function create_each_block(ctx) {
    	let div5;
    	let div2;
    	let label0;
    	let t1;
    	let div1;
    	let select;
    	let option;
    	let t3;
    	let div0;
    	let svg;
    	let path;
    	let t4;
    	let div3;
    	let label1;
    	let t6;
    	let input;
    	let t7;
    	let div4;
    	let label2;
    	let t9;
    	let textarea;
    	let textarea_data_index_value;
    	let t10;
    	let button;
    	let t11;
    	let t12_value = /*i*/ ctx[19] + 1 + "";
    	let t12;
    	let t13;
    	let dispose;
    	let each_value_1 = /*LESSON_TYPES*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[14].call(select, /*i*/ ctx[19]);
    	}

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[15].call(input, /*i*/ ctx[19]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[16](/*i*/ ctx[19], ...args);
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div2 = element("div");
    			label0 = element("label");
    			label0.textContent = "Lesson Type";
    			t1 = space();
    			div1 = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select a type";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t4 = space();
    			div3 = element("div");
    			label1 = element("label");
    			label1.textContent = "Lesson Description";
    			t6 = space();
    			input = element("input");
    			t7 = space();
    			div4 = element("div");
    			label2 = element("label");
    			label2.textContent = "General Steps";
    			t9 = space();
    			textarea = element("textarea");
    			t10 = space();
    			button = element("button");
    			t11 = text("Remove Step ");
    			t12 = text(t12_value);
    			t13 = space();
    			attr_dev(label0, "class", "text-gray-700 text-sm font-bold");
    			attr_dev(label0, "for", "type");
    			add_location(label0, file, 186, 18, 5863);
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file, 198, 22, 6436);
    			attr_dev(select, "name", "type");
    			attr_dev(select, "class", "block relative appearance-none w-full bg-white\n                      border border-gray-400 hover:border-gray-500 px-4 py-2\n                      pr-8 rounded shadow leading-tight focus:outline-none\n                      focus:shadow-outline");
    			if (/*lesson*/ ctx[0].steps[/*i*/ ctx[19]].type === void 0) add_render_callback(select_change_handler);
    			add_location(select, file, 191, 20, 6043);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10\n                          10.828 5.757 6.586 4.343 8z");
    			add_location(path, file, 210, 24, 7018);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file, 206, 22, 6832);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex\n                      items-center px-2 text-gray-700");
    			add_location(div0, file, 203, 20, 6668);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file, 190, 18, 6000);
    			attr_dev(div2, "class", "mb-4");
    			add_location(div2, file, 185, 16, 5826);
    			attr_dev(label1, "class", "text-gray-700 text-sm font-bold");
    			attr_dev(label1, "for", "desc");
    			add_location(label1, file, 221, 18, 7397);
    			attr_dev(input, "class", "shadow appearance-none border rounded w-full py-2\n                    px-3 text-gray-700 leading-tight focus:outline-none\n                    focus:shadow-outline");
    			attr_dev(input, "id", "type");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Lesson Description");
    			add_location(input, file, 224, 18, 7540);
    			attr_dev(div3, "class", "mb-4");
    			add_location(div3, file, 220, 16, 7360);
    			attr_dev(label2, "for", "typeSteps");
    			attr_dev(label2, "class", "text-gray-700 text-sm font-bold");
    			add_location(label2, file, 237, 18, 8069);
    			attr_dev(textarea, "data-index", textarea_data_index_value = /*i*/ ctx[19]);
    			attr_dev(textarea, "class", "shadow appearance-none border rounded w-full py-2\n                    px-3 text-gray-700 leading-tight focus:outline-none\n                    focus:shadow-outline");
    			attr_dev(textarea, "id", "typeSteps");
    			attr_dev(textarea, "rows", "5");
    			add_location(textarea, file, 242, 18, 8252);
    			attr_dev(div4, "class", "mb-4");
    			add_location(div4, file, 236, 16, 8032);
    			attr_dev(button, "class", "bg-red-500 hover:bg-red-700 text-white font-bold p-2\n                  text-sm rounded");
    			add_location(button, file, 253, 16, 8675);
    			attr_dev(div5, "class", "border-2 p-2 shadow-sm");
    			add_location(div5, file, 183, 14, 5736);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div2);
    			append_dev(div2, label0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*lesson*/ ctx[0].steps[/*i*/ ctx[19]].type);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div5, t4);
    			append_dev(div5, div3);
    			append_dev(div3, label1);
    			append_dev(div3, t6);
    			append_dev(div3, input);
    			set_input_value(input, /*lesson*/ ctx[0].steps[/*i*/ ctx[19]].desc);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, label2);
    			append_dev(div4, t9);
    			append_dev(div4, textarea);
    			append_dev(div5, t10);
    			append_dev(div5, button);
    			append_dev(button, t11);
    			append_dev(button, t12);
    			append_dev(div5, t13);

    			dispose = [
    				listen_dev(select, "change", select_change_handler),
    				listen_dev(input, "input", input_input_handler_1),
    				listen_dev(textarea, "input", /*codeLesson*/ ctx[5], false, false, false),
    				listen_dev(button, "click", click_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*LESSON_TYPES*/ 8) {
    				each_value_1 = /*LESSON_TYPES*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty & /*lesson*/ 1) {
    				select_option(select, /*lesson*/ ctx[0].steps[/*i*/ ctx[19]].type);
    			}

    			if (dirty & /*lesson*/ 1 && input.value !== /*lesson*/ ctx[0].steps[/*i*/ ctx[19]].desc) {
    				set_input_value(input, /*lesson*/ ctx[0].steps[/*i*/ ctx[19]].desc);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(183:12) {#each lesson.steps as step, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section;
    	let header;
    	let h1;
    	let t1;
    	let button;
    	let t3;
    	let div12;
    	let div9;
    	let div0;
    	let h20;
    	let t5;
    	let div8;
    	let div1;
    	let label0;
    	let t7;
    	let input;
    	let t8;
    	let div4;
    	let label1;
    	let t10;
    	let div3;
    	let select0;
    	let option0;
    	let t12;
    	let div2;
    	let svg0;
    	let path0;
    	let t13;
    	let div7;
    	let label2;
    	let t15;
    	let div6;
    	let select1;
    	let option1;
    	let t17;
    	let div5;
    	let svg1;
    	let path1;
    	let t18;
    	let hr;
    	let t19;
    	let t20;
    	let t21;
    	let div11;
    	let div10;
    	let h21;
    	let t23;
    	let pre;
    	let t24_value = JSON.stringify(/*lesson*/ ctx[0], null, 2) + "";
    	let t24;
    	let dispose;
    	let each_value_3 = /*CATEGORY_TYPES*/ ctx[1];
    	validate_each_argument(each_value_3);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*DIFFICULTY_TYPES*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block0 = /*lesson*/ ctx[0].category == "general" && create_if_block_2(ctx);
    	let if_block1 = /*lesson*/ ctx[0].category == "html-css" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Lesson Editor";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Save Lesson";
    			t3 = space();
    			div12 = element("div");
    			div9 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Lesson Form";
    			t5 = space();
    			div8 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Title";
    			t7 = space();
    			input = element("input");
    			t8 = space();
    			div4 = element("div");
    			label1 = element("label");
    			label1.textContent = "Category";
    			t10 = space();
    			div3 = element("div");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Select a category";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t12 = space();
    			div2 = element("div");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t13 = space();
    			div7 = element("div");
    			label2 = element("label");
    			label2.textContent = "Difficulty";
    			t15 = space();
    			div6 = element("div");
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "Select a difficulty";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t17 = space();
    			div5 = element("div");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t18 = space();
    			hr = element("hr");
    			t19 = space();
    			if (if_block0) if_block0.c();
    			t20 = space();
    			if (if_block1) if_block1.c();
    			t21 = space();
    			div11 = element("div");
    			div10 = element("div");
    			h21 = element("h2");
    			h21.textContent = "JSON Output";
    			t23 = space();
    			pre = element("pre");
    			t24 = text(t24_value);
    			attr_dev(h1, "class", "text-2xl");
    			add_location(h1, file, 56, 4, 1253);
    			attr_dev(button, "class", "bg-teal-500 hover:bg-teal-700 text-teal-100 font-light py-2 px-4\n      rounded tracking-wide");
    			add_location(button, file, 57, 4, 1297);
    			attr_dev(header, "class", "header border-b-2 border-gray-400 py-4 mb-4 flex justify-between");
    			add_location(header, file, 54, 2, 1163);
    			attr_dev(h20, "class", "text-lg font-bold");
    			add_location(h20, file, 67, 8, 1617);
    			attr_dev(div0, "class", "border-b-2 border-gray-400 p-2");
    			add_location(div0, file, 66, 6, 1564);
    			attr_dev(label0, "class", "text-gray-700 text-sm font-bold");
    			attr_dev(label0, "for", "title");
    			add_location(label0, file, 73, 10, 1767);
    			attr_dev(input, "class", "shadow appearance-none border rounded w-full py-2 px-3\n            text-gray-700 leading-tight focus:outline-none focus:shadow-outline");
    			attr_dev(input, "id", "title");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Title");
    			add_location(input, file, 76, 10, 1874);
    			attr_dev(div1, "class", "mb-4");
    			add_location(div1, file, 72, 8, 1738);
    			attr_dev(label1, "class", "text-gray-700 text-sm font-bold");
    			attr_dev(label1, "for", "category");
    			add_location(label1, file, 88, 10, 2258);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file, 100, 14, 2781);
    			attr_dev(select0, "name", "category");
    			attr_dev(select0, "class", "block relative appearance-none w-full bg-white border\n              border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded\n              shadow leading-tight focus:outline-none focus:shadow-outline");
    			if (/*lesson*/ ctx[0].category === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[11].call(select0));
    			add_location(select0, file, 93, 12, 2407);
    			attr_dev(path0, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757\n                  6.586 4.343 8z");
    			add_location(path0, file, 112, 16, 3273);
    			attr_dev(svg0, "class", "fill-current h-4 w-4");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 20 20");
    			add_location(svg0, file, 108, 14, 3119);
    			attr_dev(div2, "class", "pointer-events-none absolute inset-y-0 right-0 flex\n              items-center px-2 text-gray-700");
    			add_location(div2, file, 105, 12, 2979);
    			attr_dev(div3, "class", "relative");
    			add_location(div3, file, 92, 10, 2372);
    			attr_dev(div4, "class", "mb-4");
    			add_location(div4, file, 87, 8, 2229);
    			attr_dev(label2, "class", "text-gray-700 text-sm font-bold");
    			attr_dev(label2, "for", "difficulty");
    			add_location(label2, file, 123, 10, 3562);
    			option1.__value = "";
    			option1.value = option1.__value;
    			add_location(option1, file, 134, 14, 4041);
    			attr_dev(select1, "name", "difficulty");
    			attr_dev(select1, "class", "block relative appearance-none w-full bg-white border\n              border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded\n              shadow leading-tight focus:outline-none focus:shadow-outline");
    			if (/*lesson*/ ctx[0].difficulty === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[13].call(select1));
    			add_location(select1, file, 128, 12, 3715);
    			attr_dev(path1, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757\n                  6.586 4.343 8z");
    			add_location(path1, file, 143, 16, 4454);
    			attr_dev(svg1, "class", "fill-current h-4 w-4");
    			attr_dev(svg1, "viewBox", "0 0 20 20");
    			add_location(svg1, file, 142, 14, 4383);
    			attr_dev(div5, "class", "pointer-events-none absolute inset-y-0 right-0 flex\n              items-center px-2 text-gray-700");
    			add_location(div5, file, 139, 12, 4243);
    			attr_dev(div6, "class", "relative");
    			add_location(div6, file, 127, 10, 3680);
    			attr_dev(div7, "class", "mb-4");
    			add_location(div7, file, 122, 8, 3533);
    			attr_dev(hr, "class", "mb-2");
    			add_location(hr, file, 152, 8, 4688);
    			attr_dev(div8, "class", "form p-2");
    			add_location(div8, file, 70, 6, 1684);
    			attr_dev(div9, "class", "form-wrapper flex-auto w-1/2 pr-2");
    			add_location(div9, file, 65, 4, 1510);
    			attr_dev(h21, "class", "text-lg font-bold");
    			add_location(h21, file, 269, 8, 9149);
    			attr_dev(div10, "class", "border-b-2 border-gray-400 p-2");
    			add_location(div10, file, 268, 6, 9096);
    			attr_dev(pre, "class", "text-xs p-2 overflow-x-auto");
    			add_location(pre, file, 271, 6, 9215);
    			attr_dev(div11, "class", "display flex-initial w-1/2 pl-2");
    			add_location(div11, file, 267, 4, 9044);
    			attr_dev(div12, "class", "flex");
    			add_location(div12, file, 64, 2, 1487);
    			attr_dev(section, "class", "container mx-auto bg-white shadow-md px-4 mt-4");
    			add_location(section, file, 53, 0, 1096);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, header);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, button);
    			append_dev(section, t3);
    			append_dev(section, div12);
    			append_dev(div12, div9);
    			append_dev(div9, div0);
    			append_dev(div0, h20);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    			append_dev(div8, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t7);
    			append_dev(div1, input);
    			set_input_value(input, /*lesson*/ ctx[0].title);
    			append_dev(div8, t8);
    			append_dev(div8, div4);
    			append_dev(div4, label1);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div3, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*lesson*/ ctx[0].category);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, svg0);
    			append_dev(svg0, path0);
    			append_dev(div8, t13);
    			append_dev(div8, div7);
    			append_dev(div7, label2);
    			append_dev(div7, t15);
    			append_dev(div7, div6);
    			append_dev(div6, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*lesson*/ ctx[0].difficulty);
    			append_dev(div6, t17);
    			append_dev(div6, div5);
    			append_dev(div5, svg1);
    			append_dev(svg1, path1);
    			append_dev(div8, t18);
    			append_dev(div8, hr);
    			append_dev(div8, t19);
    			if (if_block0) if_block0.m(div8, null);
    			append_dev(div8, t20);
    			if (if_block1) if_block1.m(div8, null);
    			append_dev(div12, t21);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, h21);
    			append_dev(div11, t23);
    			append_dev(div11, pre);
    			append_dev(pre, t24);

    			dispose = [
    				listen_dev(button, "click", /*saveLesson*/ ctx[8], false, false, false),
    				listen_dev(input, "input", /*input_input_handler*/ ctx[10]),
    				listen_dev(select0, "change", /*select0_change_handler*/ ctx[11]),
    				listen_dev(select0, "change", /*change_handler*/ ctx[12], false, false, false),
    				listen_dev(select1, "change", /*select1_change_handler*/ ctx[13])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lesson*/ 1 && input.value !== /*lesson*/ ctx[0].title) {
    				set_input_value(input, /*lesson*/ ctx[0].title);
    			}

    			if (dirty & /*CATEGORY_TYPES*/ 2) {
    				each_value_3 = /*CATEGORY_TYPES*/ ctx[1];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_3.length;
    			}

    			if (dirty & /*lesson*/ 1) {
    				select_option(select0, /*lesson*/ ctx[0].category);
    			}

    			if (dirty & /*DIFFICULTY_TYPES*/ 4) {
    				each_value_2 = /*DIFFICULTY_TYPES*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*lesson*/ 1) {
    				select_option(select1, /*lesson*/ ctx[0].difficulty);
    			}

    			if (/*lesson*/ ctx[0].category == "general") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div8, t20);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*lesson*/ ctx[0].category == "html-css") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div8, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*lesson*/ 1 && t24_value !== (t24_value = JSON.stringify(/*lesson*/ ctx[0], null, 2) + "")) set_data_dev(t24, t24_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const API_URL = "http://localhost:5001/typer/lessons";

    function instance($$self, $$props, $$invalidate) {
    	const CATEGORY_TYPES = ["html-css", "general"];
    	const DIFFICULTY_TYPES = ["easy", "medium", "hard"];
    	const LESSON_TYPES = ["dom", "style"];

    	let lesson = {
    		title: "",
    		category: "",
    		difficulty: "",
    		hasCompleted: false,
    		steps: []
    	};

    	function clearLessons() {
    		$$invalidate(0, lesson.steps = [], lesson);
    	}

    	function typingLesson({ target }) {
    		const val = target.value.split("\n");
    		$$invalidate(0, lesson.steps = val, lesson);
    	}

    	function codeLesson(e) {
    		const target = e.target;
    		const val = target.value.split("\n");
    		const index = +target.dataset.index;
    		$$invalidate(0, lesson.steps[index].action = val, lesson);
    	}

    	function addStep() {
    		const newStep = {
    			type: "",
    			desc: "",
    			action: [],
    			render: true
    		};

    		$$invalidate(0, lesson.steps = [...lesson.steps, newStep], lesson);
    	}

    	function removeStep(index) {
    		const remove = lesson.steps.splice(index, 1);
    		$$invalidate(0, lesson);
    	}

    	function saveLesson() {
    		console.log(lesson);
    	}

    	function input_input_handler() {
    		lesson.title = this.value;
    		$$invalidate(0, lesson);
    		$$invalidate(1, CATEGORY_TYPES);
    	}

    	function select0_change_handler() {
    		lesson.category = select_value(this);
    		$$invalidate(0, lesson);
    		$$invalidate(1, CATEGORY_TYPES);
    	}

    	const change_handler = () => $$invalidate(0, lesson.steps = [], lesson);

    	function select1_change_handler() {
    		lesson.difficulty = select_value(this);
    		$$invalidate(0, lesson);
    		$$invalidate(1, CATEGORY_TYPES);
    	}

    	function select_change_handler(i) {
    		lesson.steps[i].type = select_value(this);
    		$$invalidate(0, lesson);
    		$$invalidate(1, CATEGORY_TYPES);
    	}

    	function input_input_handler_1(i) {
    		lesson.steps[i].desc = this.value;
    		$$invalidate(0, lesson);
    		$$invalidate(1, CATEGORY_TYPES);
    	}

    	const click_handler = i => removeStep(i);

    	$$self.$capture_state = () => ({
    		API_URL,
    		CATEGORY_TYPES,
    		DIFFICULTY_TYPES,
    		LESSON_TYPES,
    		lesson,
    		clearLessons,
    		typingLesson,
    		codeLesson,
    		addStep,
    		removeStep,
    		saveLesson,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("lesson" in $$props) $$invalidate(0, lesson = $$props.lesson);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		lesson,
    		CATEGORY_TYPES,
    		DIFFICULTY_TYPES,
    		LESSON_TYPES,
    		typingLesson,
    		codeLesson,
    		addStep,
    		removeStep,
    		saveLesson,
    		clearLessons,
    		input_input_handler,
    		select0_change_handler,
    		change_handler,
    		select1_change_handler,
    		select_change_handler,
    		input_input_handler_1,
    		click_handler
    	];
    }

    class LessonEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LessonEdit",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.19.1 */

    const file$1 = "src/components/Nav.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let h1;
    	let t1;
    	let div1;
    	let div0;
    	let a0;
    	let a0_href_value;
    	let t3;
    	let a1;
    	let a1_href_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			h1 = element("h1");
    			h1.textContent = "Lesson Builder";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "All Lessons";
    			t3 = space();
    			a1 = element("a");
    			a1.textContent = "Add New Lesson";
    			attr_dev(h1, "class", "font-semibold text-xl tracking-tight text-white mr-6");
    			add_location(h1, file$1, 1, 2, 76);
    			attr_dev(a0, "href", a0_href_value = null);
    			attr_dev(a0, "class", "inline-block text-teal-300 hover:text-white mr-4");
    			add_location(a0, file$1, 7, 6, 241);
    			attr_dev(a1, "href", a1_href_value = null);
    			attr_dev(a1, "class", "inline-block text-teal-300 hover:text-white mr-4");
    			add_location(a1, file$1, 10, 6, 351);
    			attr_dev(div0, "class", "text-sm lg:flex-grow");
    			add_location(div0, file$1, 6, 4, 200);
    			attr_dev(div1, "class", "flex-grow");
    			add_location(div1, file$1, 5, 2, 172);
    			attr_dev(nav, "class", "flex items-center justify-between flex-wrap bg-teal-500 p-5");
    			add_location(nav, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, h1);
    			append_dev(nav, t1);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t3);
    			append_dev(div0, a1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const subscriber_queue = [];
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
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
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
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const AppStateEnums = {
      appStart: "WELCOME_SCREEN",
      allLessons: "ALL_LESSONS",
      lesson: "LESSON"
    };

    const defaultState = { state: AppStateEnums.appStart, session_start: Date.now() };

    function CreateAppState() {
      const { subscribe, update } = writable(defaultState);

      function setState(detail) {
        update((obj) => {
          obj.state = detail;
          return obj;
        });
      }

      return {
        subscribe,
        setState,
      };
    }

    const APP_STATE = CreateAppState();

    /* src/App.svelte generated by Svelte v3.19.1 */

    const file$2 = "src/App.svelte";

    // (45:2) {#if !appState || appState == AppStateEnums.appStart}
    function create_if_block_2$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(45:2) {#if !appState || appState == AppStateEnums.appStart}",
    		ctx
    	});

    	return block;
    }

    // (49:2) {#if appState == AppStateEnums.allLessons}
    function create_if_block_1$1(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(49:2) {#if appState == AppStateEnums.allLessons}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#if appState == AppStateEnums.lesson}
    function create_if_block$1(ctx) {
    	let current;
    	const lessonedit = new LessonEdit({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(lessonedit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(lessonedit, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lessonedit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lessonedit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(lessonedit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(53:2) {#if appState == AppStateEnums.lesson}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let main;
    	let t1;
    	let t2;
    	let current;
    	const nav = new Nav({ $$inline: true });
    	let if_block0 = (!/*appState*/ ctx[0] || /*appState*/ ctx[0] == AppStateEnums.appStart) && create_if_block_2$1(ctx);
    	let if_block1 = /*appState*/ ctx[0] == AppStateEnums.allLessons && create_if_block_1$1(ctx);
    	let if_block2 = /*appState*/ ctx[0] == AppStateEnums.lesson && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			add_location(main, file$2, 43, 0, 1713);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			if (if_block2) if_block2.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*appState*/ ctx[0] || /*appState*/ ctx[0] == AppStateEnums.appStart) {
    				if (!if_block0) {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(main, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*appState*/ ctx[0] == AppStateEnums.allLessons) {
    				if (!if_block1) {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(main, t2);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*appState*/ ctx[0] == AppStateEnums.lesson) {
    				if (!if_block2) {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				} else {
    					transition_in(if_block2, 1);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $APP_STATE;
    	validate_store(APP_STATE, "APP_STATE");
    	component_subscribe($$self, APP_STATE, $$value => $$invalidate(1, $APP_STATE = $$value));
    	APP_STATE.setState(AppStateEnums.lesson);

    	$$self.$capture_state = () => ({
    		LessonEdit,
    		Nav,
    		APP_STATE,
    		AppStateEnums,
    		appState,
    		$APP_STATE
    	});

    	$$self.$inject_state = $$props => {
    		if ("appState" in $$props) $$invalidate(0, appState = $$props.appState);
    	};

    	let appState;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$APP_STATE*/ 2) {
    			 $$invalidate(0, appState = $APP_STATE.state);
    		}
    	};

    	return [appState];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
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
