<script>
  import { page } from '$app/stores'
  import logo from '$lib/assets/logo-512x512.png'
  import Nav from '$lib/Nav.svelte'
</script>

<svelte:head>
  <title>{$page.data.title}</title>
  <html lang="en" />
</svelte:head>

<header>
  <Nav></Nav>
  <h1 id="title">{$page.data.title}</h1>
  <img
    src={logo}
    title="BBS Mixer - Home"
    class="logo"
    alt="logo" />
</header>

<slot></slot>

<style>
  :global(body) {
    padding-left: 1em;
    padding-right: 1em;
  }

  :global(h1) {
    font-size: 1.6rem;
    font-weight: 600;
    line-height: 1;
    margin-left: 1rem;
  }

  :global(fieldset) {
    margin-left: 2px;
    margin-right: 2px;
    padding-top: 0.35em;
    padding-bottom: 0.625em;
    padding-left: 0.75em;
    padding-right: 0.75em;
    border: 2px groove (internal value);
  }

  :global(dl) {
    margin-top: 1em;
    margin-bottom: 1em;
    margin-left: 0;
    margin-right: 0;
  }

  :global(dt) {
    font-weight: bold;
  }

  :global(dd) {
    display: block;
    margin-left: 40px;
  }

  :global(legend) {
    padding-left: 2px;
    padding-right: 2px;
    border: none;
  }

  :global(p) {
    margin-top: 1em;
    margin-bottom: 1em;
    margin-left: 0;
    margin-right: 0;
  }

  :global(ul) {
    list-style-type: disc;
    margin-top: 1em;
    margin-bottom: 1 em;
    margin-left: 0;
    margin-right: 0;
    padding-left: 40px;
  }

  .logo {
    height: 4em;
    will-change: filter;
  }

  header {
    margin-bottom: 0.5rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1em;
  }

  #title {
    flex-grow: 2;
    text-align: center;
  }

  :global(a) {
    font-weight: 500;
    text-decoration: underline;
    font-size: inherit;
    cursor: pointer;
  }
  :global(nav a) {
    margin-left: 1em;
    font-size: larger;
  }

  /*
  :global(:root) {
    --background-color: #242424;
    --color: #ffffff;
    --highlight-color: lightblue;
    --link-color: #858bff;
    background-color: var(--background-color);
    color: var(--color);
    font-family: Sans-Serif;
    color-scheme: light dark;
  }

  @media (prefers-color-scheme: light) {
    :global(:root) {
      --background-color: #ffffff;
      --color: #242424;
      --highlight-color: darkblue;
    }
  }
*/
</style>
