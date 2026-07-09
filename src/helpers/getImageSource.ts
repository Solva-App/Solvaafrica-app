export const getImageSource = (url: string | null) => {
    if (url) {
        if (url.toLowerCase().includes('.pdf')) {
            return require('../../assets/images/pdf-image.jpg');
        }
        return { uri: url }
    }

    return require('../../assets/images/placeholder.png')
}