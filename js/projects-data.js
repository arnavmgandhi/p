/**
 * PROJECTS DATA
 * Single source of truth for the Selected Work list.
 * Replace liveUrl / repoUrl with real links. Leave one empty ("") to hide it.
 * image: path to a screenshot, e.g. "assets/projects/motion-canvas.jpg" (4:3 works best).
 *        Leave "" to show the coloured tile (tile: text, bg, fg).
 */

const portfolioProjects = [
  {
    id: "club-website",
    title: "Club Website",
    description: "A full website for a college club with three sides: a public site for visitors, a member login for the club's members, and an admin login to manage the club.",
    tile: { text: "Club", bg: "#d8a23a", fg: "#16140f" },
    image: "",
    liveUrl: "https://clubprojecteg.netlify.app",
    repoUrl: ""
  },
  {
    id: "jujutsu-kaisen-game",
    title: "Jujutsu Kaisen Game",
    description: "A browser game based on the anime Jujutsu Kaisen. Open the link and play, with nothing to install.",
    tile: { text: "\u546a", bg: "#8c2216", fg: "#f1eee7" },
    image: "",
    liveUrl: "https://jujutsukaisengame.netlify.app",
    repoUrl: ""
  }
];

if (typeof window !== 'undefined') {
  window.portfolioProjects = portfolioProjects;
}
