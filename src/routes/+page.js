export function load({ params }) {
    return {
        title: 'BBS Mixer',
        nav: [{ type: 'filepicker', label: 'Load Folder' },
        { href: '/faq', label: 'FAQ' },
        { href: '/settings', label: 'Settings' }],
    }
}