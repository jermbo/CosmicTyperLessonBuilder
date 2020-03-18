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

  function isActive({ location, href, isPartiallyCurrent, isCurrent }) {
    return href === "/" ? isCurrent : isPartiallyCurrent || isCurrent;
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
      <!-- <NavItem>
        <NavLink active={() => isActive()} href="/lessons">All Lessons</NavLink>
      </NavItem> -->
    </Nav>
  </Collapse>
</Navbar>
