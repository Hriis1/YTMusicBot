function isYouTubeLink(input) {
    return input.startsWith("https://www.youtube.com/watch?");
}

module.exports = {
    isYouTubeLink
};