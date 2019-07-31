document.querySelector("#navbar").innerHTML =`<a class="navbar-brand text-white-50" href="index.html"><i>White Whale Stories</i></a>
 <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarToggler" aria-controls="navbarToggler" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarToggler">
    <a class="nav-link text-white" href="api.html">API</a>
    <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Tutorials</a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="parsing.html">Parsing Part One</a>
          <a class="dropdown-item" href="parsing2.html">Parsing Part Two</a>
          <a class="dropdown-item" href="parsing3.html">Parsing Part Three</a>
        </div>
    </div>
    <a class="nav-link text-white" href="http://patreon.com/bikibird">Sponsorship</a>
  </div>
`
