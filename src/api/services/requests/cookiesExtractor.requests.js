export const cookiesExtractor = (req) => {
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? (
        Object.fromEntries(
            cookieHeader.split('; ').map(cookie => {
                const [name, ...rest] = cookie.split('=');
                return [name, rest.join('=')];
            })
        )
    ) : {};

    req.body.cookies = cookies;

    return (cookies);
};