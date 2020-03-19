<script>
  import { createEventDispatcher } from "svelte";
  import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Container,
    Row,
    Col,
    Button,
  } from "sveltestrap";

  const dispatch = createEventDispatcher();

  let isOpen = false;

  let filteredDifficulty = null;

  function setFilter(option) {
    filteredDifficulty = option;
    dispatch("filterSelected", option);
  }
</script>

<Dropdown {isOpen} toggle={() => (isOpen = !isOpen)}>
  <DropdownToggle caret>
    {filteredDifficulty ? `Filtered : ${filteredDifficulty}` : 'Filter Difficulty'}
  </DropdownToggle>
  <DropdownMenu>
    <DropdownItem
      on:click={() => {
        setFilter('');
      }}>
      Show All
    </DropdownItem>
    <DropdownItem
      on:click={() => {
        setFilter('easy');
      }}>
      Easy
    </DropdownItem>
    <DropdownItem
      on:click={() => {
        setFilter('medium');
      }}>
      Medium
    </DropdownItem>
    <DropdownItem
      on:click={() => {
        setFilter('hard');
      }}>
      Hard
    </DropdownItem>
  </DropdownMenu>
</Dropdown>
