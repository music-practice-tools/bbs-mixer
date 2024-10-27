<script>
  import Layout from '../+layout.svelte'
</script>

<dl>
  <dt>What is BBS Mixer?</dt>
  <dd>
    BBS Mixer is a web app for playing audio files provided with musical
    compositions purchased from BBS. The files usually match the parts in the
    score.
  </dd>

  <dt>What does BBS Mixer do?</dt>
  <dd>
    BBS Mixer is similar to any music player that plays audio files downloaded
    onto your computer. However, rather than playing a single file at a time, it
    plays a set of related part files, keeping them synchronised. In addition,
    you can adjust the volume levels of the tracks. You can also mute or solo
    several tracks at once. The play position in the track can be changed too
    (AKA scrubbing).
  </dd>

  <dt>Why would I use it?</dt>
  <dd>
    In addition to playing the full score orchestration it is possible to
    selectively play or leave out various instruments. This allows the study of
    individual or related parts. Plus, the pre recorded tracks can also be used
    to substitute for missing performers in an orchestra or band.
  </dd>

  <dt>How do I get BBS Mixer?</dt>
  <dd>
    BBS Mixer is a available as free download from a link supplied when you
    purchase music from BBS. If you need to get it again then ????.
  </dd>

  <dt>How do I play audio files?</dt>
  <dd>
    When you purchase a score from BBS you can download a zip archive of audio
    files for the various instrument parts. Simply <a
      href="https://support.apple.com/en-gb/guide/mac-help/mchlp2528/mac"
      >unzip</a> the files into a folder and then open that folder with the BBS Mixer.
    Then hit the play button as usual.
  </dd>

  <dt>How do I select a folder?</dt>
  <dd>
    An operating system file selection box is presented and the current folder
    is usually shown at the top, Sometimes no files or folders are shown but the
    current folder can still be selected. Selecting folders is inconsistently
    supported across web browsers and you may need to accept access to the files
    after selecting the folder. In general Chrome provides the smoothest
    experience.
  </dd>

  <dt>How are the channels ordered and the labels decided?</dt>
  <dd>
    The channel labels are derived from the filenames. They are ordered
    alphabetically, eg "piano" appears to the left of "tuba". Any file extension
    (eg .mp3) is dropped from the label. In addition, any leading digits
    followed by a space are also dropped but allow control of the order of the
    channels. So for example, the files "01 tuba.mp3" and "02 piano.mp3" will
    result in "tuba" followed by "piano".
  </dd>

  <dt>Can I play other audio files?</dt>
  <dd>
    Most audio file formats are supported. Obviously, the files in a folder need
    to be designed to be played together. The files created by stem extraction
    tools, for example, work well.
  </dd>

  <dt>What are the settings?</dt>
  <dd>Show pan controls: shows left/right pan controls on the channels.</dd>

  <dt>Can I see any information about the files?</dt>
  <dd>
    The package of files usually includes a "readme.txt" file containing
    information about the audio files.
  </dd>

  <dt>Is there anything to help when files don't play</dt>
  <dd>
    Try the <a href="/test">test page</a> which shows information including files
    in the selected folder, which can be played and any errors when trying to play
    them.
  </dd>
</dl>

<style>
</style>
