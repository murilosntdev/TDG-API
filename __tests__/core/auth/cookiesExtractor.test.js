import { cookiesExtractor } from "../../../src/core/auth/cookiesExtractor.js";

describe('Auth Util: cookiesExtractor', () => {

    it('should create an empty cookies object if no cookie header is present', () => {
        const mockReq = {
            headers: {}
        };

        cookiesExtractor(mockReq);

        expect(mockReq.cookies).toBeDefined();
        expect(mockReq.cookies).toEqual({});
    });

    it('should parse a single cookie from the header', () => {
        const mockReq = {
            headers: {
                cookie: 'mycookie=myvalue'
            }
        };

        cookiesExtractor(mockReq);

        expect(mockReq.cookies).toEqual({ mycookie: 'myvalue' });
    });

    it('should parse multiple cookies from the header', () => {
        const mockReq = {
            headers: {
                cookie: 'cookie1=value1; cookie2=value2'
            }
        };

        cookiesExtractor(mockReq);

        expect(mockReq.cookies).toEqual({
            cookie1: 'value1',
            cookie2: 'value2'
        });
    });

    it('should correctly parse a cookie value that contains an equals sign', () => {
        const jwt = 'header.payload=signature';
        const mockReq = {
            headers: {
                cookie: `token=${jwt}`
            }
        };

        cookiesExtractor(mockReq);

        expect(mockReq.cookies).toEqual({ token: jwt });
    });

    it('should handle an empty cookie header gracefully', () => {
        const mockReq = {
            headers: {
                cookie: ''
            }
        };

        cookiesExtractor(mockReq);

        expect(mockReq.cookies).toEqual({ '': undefined });
    });

    it('should return the parsed cookies object', () => {
        const mockReq = {
            headers: {
                cookie: 'cookie1=value1'
            }
        };

        const result = cookiesExtractor(mockReq);

        expect(result).toEqual({ cookie1: 'value1' });
    });
});
