export function load({ params }) {
    return {
        mixer: true,
        title: 'BBS Mixer',
        nav: [{ type: 'filepicker', label: 'Load Folder' }, { href: '/faq', label: 'FAQ' }],
    }
}