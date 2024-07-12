<script>
  import Mixer from '$lib/Mixer.svelte'
  import logo from '$lib/assets/logo-512x512.png'

  document.title = 'BBS Mixer'
</script>

<header>
  <img
    src={logo}
    title="BBS Mixer"
    class="logo"
    alt="logo" />
  <h1>{document.title}</h1>
  <nav>
    <a
      href="/about"
      data-sveltekit-reload>FAQ</a>
  </nav>
</header>

<Mixer />

<style>
  /*
  #app {
    max-width: 1280px;
    margin: 0 auto 0 auto;
    padding: 0rem;
    text-align: left;
  }
*/
</style>
