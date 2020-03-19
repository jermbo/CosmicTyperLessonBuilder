<script>
  import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
  } from "sveltestrap";

  import { Router, Link, Route } from "svelte-routing";
  import { getContext } from "svelte";
  import { ROUTER } from "svelte-routing/src/contexts";

  const { activeRoute } = getContext(ROUTER);

  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const item = href === "/" ? isCurrent : isPartiallyCurrent || isCurrent;
    console.log(item);
    return item;
  }

  let isOpen = false;
  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  function updateState(state) {
    APP_STATE.setState(state);
  }
</script>

<Navbar color="light" light expand="md">
  <NavbarBrand href="/lessons">Typer Lesson Builder</NavbarBrand>
  <NavbarToggler on:click={() => (isOpen = !isOpen)} />
  <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
    <Nav class="" navbar>
      <NavItem
        active={() => {
          console.log('what');
          getProps();
        }}>
        <Link to="/web-lessons">Web Lessons</Link>
      </NavItem>
      <NavItem>
        <Link to="/typing-lessons">Typing Lessons</Link>
      </NavItem>
    </Nav>
  </Collapse>
</Navbar>
