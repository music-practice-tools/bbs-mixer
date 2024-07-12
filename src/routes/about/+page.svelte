<script>
  import logo from '$lib/assets/logo-512x512.png'
  document.title = 'BBS Mixer FAQ'
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
      href="/"
      data-sveltekit-reload>Back to App</a>
  </nav>
</header>

<p>
  <strong>BBS Mixer</strong> is a web app for playing musical compositions purchased
  from BBS.
</p>

<p>
  As well as the score pdf you get a zip archive of audio files for the various
  instrument parts. This mixer app lets you explore the composition by changing
  part levels or playing only specific parts, perhaps to supplement live
  players.
</p>

<ul role="list">
  <li>Load a directory of the unzipped audio files on your computer.</li>
  <li>Play, rewind and scrub to a specific position in the track.</li>
  <li>Adjust part levels, mute them or solo one or more.</li>
</ul>

<style>
</style>
