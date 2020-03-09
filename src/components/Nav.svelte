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

  // Stores
  import { APP_STATE } from "Stores/AppState.js";

  // Helpers and Enums
  import { AppStateEnums } from "Scripts/enum.js";

  let isOpen = false;
  function handleUpdate(event) {
    isOpen = event.detail.isOpen;
  }

  function updateState(state) {
    APP_STATE.setState(state);
  }
</script>

<Navbar color="light" light expand="md">
  <NavbarBrand
    href={null}
    on:click={() => {
      updateState(AppStateEnums.allLessons);
    }}>
    Typer Lesson Builder
  </NavbarBrand>
  <NavbarToggler on:click={() => (isOpen = !isOpen)} />
  <Collapse {isOpen} navbar expand="md" on:update={handleUpdate}>
    <Nav class="" navbar>
      <NavItem active={$APP_STATE.state == AppStateEnums.allLessons}>
        <NavLink
          href={null}
          on:click={() => {
            updateState(AppStateEnums.allLessons);
          }}>
          All Lessons
        </NavLink>
      </NavItem>
      <NavItem active={$APP_STATE.state == AppStateEnums.editLesson}>
        <NavLink
          href={null}
          on:click={() => {
            updateState(AppStateEnums.editLesson);
            APP_STATE.setCurrentLessonId(-1);
          }}>
          Add Lesson
        </NavLink>
      </NavItem>
    </Nav>
  </Collapse>
</Navbar>
