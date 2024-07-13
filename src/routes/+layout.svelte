<script>
  import logo from '$lib/assets/logo-512x512.png'
  import { page } from '$app/stores'
</script>

<svelte:head>
  <title>{$page.data.title}</title>
  <html lang="en" />
</svelte:head>

<header>
  <img
    src={logo}
    title="BBS Mixer"
    class="logo"
    alt="logo" />
  <h1>{$page.data.title}</h1>
  <nav>
    <a
      href={$page.data.nav.href}
      data-sveltekit-reload>{$page.data.nav.label}</a>
  </nav>
</header>

<slot></slot>

<style>
  :global(body) {
    padding-left: 1em;
    padding-right: 1em;
  }

  :global(h1) {
    font-size: 1.5rem;
    font-weight: 500;
    line-height: 1;
    margin-left: 1rem;
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
    justify-content: space-between;
    align-items: center;
  }

  :global(a) {
    font-weight: 500;
    color: var(--link-color);
    text-decoration: underline;
    margin-left: 5px;
    font-size: inherit;
    cursor: pointer;
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
