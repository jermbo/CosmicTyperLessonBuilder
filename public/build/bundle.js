
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
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

    /* src/components/TyperLesson.svelte generated by Svelte v3.18.2 */

    const file = "src/components/TyperLesson.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (70:8) {#each CATEGORY_TYPES as type}
    function create_each_block_3(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[18] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file, 70, 10, 1662);
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
    		source: "(70:8) {#each CATEGORY_TYPES as type}",
    		ctx
    	});

    	return block;
    }

    // (80:8) {#each DIFFICULTY_TYPES as type}
    function create_each_block_2(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[18] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file, 80, 10, 1969);
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
    		source: "(80:8) {#each DIFFICULTY_TYPES as type}",
    		ctx
    	});

    	return block;
    }

    // (86:4) {#if lesson.category == 'general'}
    function create_if_block_1(ctx) {
    	let label;
    	let t1;
    	let textarea;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Steps";
    			t1 = space();
    			textarea = element("textarea");
    			attr_dev(label, "for", "typeSteps");
    			add_location(label, file, 86, 6, 2095);
    			attr_dev(textarea, "id", "typeSteps");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file, 87, 6, 2138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, textarea, anchor);
    			dispose = listen_dev(textarea, "input", /*typingLesson*/ ctx[4], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(textarea);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(86:4) {#if lesson.category == 'general'}",
    		ctx
    	});

    	return block;
    }

    // (91:4) {#if lesson.category == 'html-css'}
    function create_if_block(ctx) {
    	let br0;
    	let t0;
    	let hr;
    	let t1;
    	let button;
    	let t3;
    	let br1;
    	let t4;
    	let each_1_anchor;
    	let dispose;
    	let each_value = /*lesson*/ ctx[0].steps;
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			br0 = element("br");
    			t0 = space();
    			hr = element("hr");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Add New Step";
    			t3 = space();
    			br1 = element("br");
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(br0, file, 91, 6, 2267);
    			add_location(hr, file, 92, 6, 2280);
    			add_location(button, file, 93, 6, 2293);
    			add_location(br1, file, 94, 6, 2348);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			dispose = listen_dev(button, "click", /*addStep*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*removeStep, codeLesson, lesson, LESSON_TYPES*/ 169) {
    				each_value = /*lesson*/ ctx[0].steps;
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
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(91:4) {#if lesson.category == 'html-css'}",
    		ctx
    	});

    	return block;
    }

    // (102:14) {#each LESSON_TYPES as type}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*type*/ ctx[18] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*type*/ ctx[18];
    			option.value = option.__value;
    			add_location(option, file, 102, 16, 2680);
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
    		source: "(102:14) {#each LESSON_TYPES as type}",
    		ctx
    	});

    	return block;
    }

    // (96:6) {#each lesson.steps as step, i}
    function create_each_block(ctx) {
    	let div3;
    	let div0;
    	let label0;
    	let t1;
    	let select;
    	let option;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let input;
    	let t6;
    	let div2;
    	let label2;
    	let t8;
    	let textarea;
    	let textarea_data_index_value;
    	let t9;
    	let button;
    	let t10;
    	let t11_value = /*i*/ ctx[17] + 1 + "";
    	let t11;
    	let t12;
    	let dispose;
    	let each_value_1 = /*LESSON_TYPES*/ ctx[3];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[12].call(select, /*i*/ ctx[17]);
    	}

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[13].call(input, /*i*/ ctx[17]);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[14](/*i*/ ctx[17], ...args);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Difficulty";
    			t1 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select a type";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Lesson Desc";
    			t5 = space();
    			input = element("input");
    			t6 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Steps";
    			t8 = space();
    			textarea = element("textarea");
    			t9 = space();
    			button = element("button");
    			t10 = text("Remove Step ");
    			t11 = text(t11_value);
    			t12 = space();
    			attr_dev(label0, "for", "difficulty");
    			add_location(label0, file, 98, 12, 2453);
    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file, 100, 14, 2581);
    			attr_dev(select, "id", "difficulty");
    			if (/*lesson*/ ctx[0].steps[/*i*/ ctx[17]].type === void 0) add_render_callback(select_change_handler);
    			add_location(select, file, 99, 12, 2508);
    			add_location(div0, file, 97, 10, 2435);
    			attr_dev(label1, "for", "desc");
    			add_location(label1, file, 108, 12, 2807);
    			attr_dev(input, "id", "desc");
    			attr_dev(input, "type", "text");
    			add_location(input, file, 109, 12, 2857);
    			add_location(div1, file, 107, 10, 2789);
    			attr_dev(label2, "for", "lessonStep");
    			add_location(label2, file, 113, 12, 2969);
    			attr_dev(textarea, "data-index", textarea_data_index_value = /*i*/ ctx[17]);
    			attr_dev(textarea, "id", "lessonStep");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			add_location(textarea, file, 114, 12, 3019);
    			add_location(div2, file, 112, 10, 2951);
    			add_location(button, file, 122, 10, 3203);
    			attr_dev(div3, "class", "stepGroup");
    			add_location(div3, file, 96, 8, 2401);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*lesson*/ ctx[0].steps[/*i*/ ctx[17]].type);
    			append_dev(div3, t3);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, input);
    			set_input_value(input, /*lesson*/ ctx[0].steps[/*i*/ ctx[17]].desc);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t8);
    			append_dev(div2, textarea);
    			append_dev(div3, t9);
    			append_dev(div3, button);
    			append_dev(button, t10);
    			append_dev(button, t11);
    			append_dev(div3, t12);

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
    				select_option(select, /*lesson*/ ctx[0].steps[/*i*/ ctx[17]].type);
    			}

    			if (dirty & /*lesson*/ 1 && input.value !== /*lesson*/ ctx[0].steps[/*i*/ ctx[17]].desc) {
    				set_input_value(input, /*lesson*/ ctx[0].steps[/*i*/ ctx[17]].desc);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(96:6) {#each lesson.steps as step, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div5;
    	let h1;
    	let t1;
    	let div3;
    	let div0;
    	let label0;
    	let t3;
    	let input;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let select0;
    	let option0;
    	let t8;
    	let div2;
    	let label2;
    	let t10;
    	let select1;
    	let option1;
    	let t12;
    	let t13;
    	let t14;
    	let div4;
    	let h5;
    	let t16;
    	let pre;
    	let t17_value = JSON.stringify(/*lesson*/ ctx[0], null, 2) + "";
    	let t17;
    	let dispose;
    	let each_value_3 = /*CATEGORY_TYPES*/ ctx[1];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*DIFFICULTY_TYPES*/ ctx[2];
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block0 = /*lesson*/ ctx[0].category == "general" && create_if_block_1(ctx);
    	let if_block1 = /*lesson*/ ctx[0].category == "html-css" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Lesson Builder";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Title";
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Category";
    			t6 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Select a category";

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t8 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Difficulty";
    			t10 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "Select a difficulty";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			if (if_block0) if_block0.c();
    			t13 = space();
    			if (if_block1) if_block1.c();
    			t14 = space();
    			div4 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Lesson output";
    			t16 = space();
    			pre = element("pre");
    			t17 = text(t17_value);
    			add_location(h1, file, 55, 2, 1228);
    			attr_dev(label0, "for", "title");
    			add_location(label0, file, 58, 6, 1276);
    			attr_dev(input, "id", "title");
    			attr_dev(input, "type", "text");
    			add_location(input, file, 59, 6, 1315);
    			add_location(div0, file, 57, 4, 1264);
    			attr_dev(label1, "for", "category");
    			add_location(label1, file, 63, 6, 1402);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file, 68, 8, 1569);
    			attr_dev(select0, "id", "category");
    			if (/*lesson*/ ctx[0].category === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[9].call(select0));
    			add_location(select0, file, 64, 6, 1447);
    			add_location(div1, file, 62, 4, 1390);
    			attr_dev(label2, "for", "difficulty");
    			add_location(label2, file, 76, 6, 1759);
    			option1.__value = "";
    			option1.value = option1.__value;
    			add_location(option1, file, 78, 8, 1872);
    			attr_dev(select1, "id", "difficulty");
    			if (/*lesson*/ ctx[0].difficulty === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[11].call(select1));
    			add_location(select1, file, 77, 6, 1808);
    			add_location(div2, file, 75, 4, 1747);
    			add_location(div3, file, 56, 2, 1254);
    			add_location(h5, file, 129, 4, 3354);
    			attr_dev(pre, "class", "svelte-b968ws");
    			add_location(pre, file, 130, 4, 3381);
    			attr_dev(div4, "class", "lesson-output");
    			add_location(div4, file, 128, 2, 3322);
    			attr_dev(div5, "class", "form-wrapper svelte-b968ws");
    			add_location(div5, file, 54, 0, 1199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, h1);
    			append_dev(div5, t1);
    			append_dev(div5, div3);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input);
    			set_input_value(input, /*lesson*/ ctx[0].title);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, select0);
    			append_dev(select0, option0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			select_option(select0, /*lesson*/ ctx[0].category);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t10);
    			append_dev(div2, select1);
    			append_dev(select1, option1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			select_option(select1, /*lesson*/ ctx[0].difficulty);
    			append_dev(div3, t12);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t13);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, h5);
    			append_dev(div4, t16);
    			append_dev(div4, pre);
    			append_dev(pre, t17);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    				listen_dev(select0, "change", /*select0_change_handler*/ ctx[9]),
    				listen_dev(select0, "change", /*change_handler*/ ctx[10], false, false, false),
    				listen_dev(select1, "change", /*select1_change_handler*/ ctx[11])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*lesson*/ 1 && input.value !== /*lesson*/ ctx[0].title) {
    				set_input_value(input, /*lesson*/ ctx[0].title);
    			}

    			if (dirty & /*CATEGORY_TYPES*/ 2) {
    				each_value_3 = /*CATEGORY_TYPES*/ ctx[1];
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
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div3, t13);
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
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*lesson*/ 1 && t17_value !== (t17_value = JSON.stringify(/*lesson*/ ctx[0], null, 2) + "")) set_data_dev(t17, t17_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
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

    function instance($$self, $$props, $$invalidate) {
    	const CATEGORY_TYPES = ["html-css", "general"];
    	const DIFFICULTY_TYPES = ["easy", "medium", "hard"];
    	const LESSON_TYPES = ["dom", "style"];

    	let lesson = {
    		title: "",
    		category: "html-css",
    		difficulty: "",
    		hasCompleted: false,
    		steps: []
    	};

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
    			action: [""],
    			render: true
    		};

    		$$invalidate(0, lesson.steps = [...lesson.steps, newStep], lesson);
    	}

    	function removeStep(index) {
    		const remove = lesson.steps.splice(index, 1);
    		$$invalidate(0, lesson);
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

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("lesson" in $$props) $$invalidate(0, lesson = $$props.lesson);
    	};

    	return [
    		lesson,
    		CATEGORY_TYPES,
    		DIFFICULTY_TYPES,
    		LESSON_TYPES,
    		typingLesson,
    		codeLesson,
    		addStep,
    		removeStep,
    		input_input_handler,
    		select0_change_handler,
    		change_handler,
    		select1_change_handler,
    		select_change_handler,
    		input_input_handler_1,
    		click_handler
    	];
    }

    class TyperLesson extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TyperLesson",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.18.2 */
    const file$1 = "src/App.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let current;
    	const typerlesson = new TyperLesson({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(typerlesson.$$.fragment);
    			add_location(main, file$1, 29, 0, 1444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(typerlesson, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(typerlesson.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(typerlesson.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(typerlesson);
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

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
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
