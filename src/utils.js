function isYouTubeLink(input) {
    return input.startsWith("https://www.youtube.com/watch?");
}

function isYouTubePlaylist(input) {
    return input.startsWith("https://www.youtube.com/playlist?");
}

function isWholeNumber(input) {
    return /^\d+$/.test(input);
  }

module.exports = {
    isYouTubeLink,
    isYouTubePlaylist,
    isWholeNumber
};