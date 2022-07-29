import {
	getExternalScripts as rawGetExternalScripts,
	getExternalStyleSheets as rawGetExternalStyleSheets,
} from './../index';

test('test cache response if promise resolved', async done => {
	const fetch = jest.fn().mockImplementation((url, opts) => {
		return Promise.resolve({
			text: () => {
			},
		});
	});

	const importHTML = jest.fn().mockImplementation((url, { fetch }) => {
		return {
			getExternalScripts: () => rawGetExternalScripts(['http://kuitos.me/index.js'], fetch),
			getExternalStyleSheets: () => rawGetExternalStyleSheets(['http://kuitos.me/index.css'], fetch),
		};
	});

	const { getExternalScripts, getExternalStyleSheets } = await importHTML('http://kuitos.me', { fetch });
	await getExternalScripts();
  expect(fetch).toBeCalledTimes(1);
  fetch.mockClear();
  await getExternalScripts();
  expect(fetch).not.toBeCalled(); // read cache
  fetch.mockClear();

  await getExternalStyleSheets();
  expect(fetch).toBeCalledTimes(1);
  fetch.mockClear();
  await getExternalStyleSheets();
  expect(fetch).not.toBeCalled(); // read cache

  done();
});

test('test response not cached if promise rejected', async done => {
  // const err = new Error('response failed');
  const fetch = jest.fn().mockImplementation((url, opts) => {
    return Promise.resolve({
			text: () => {
        return Promise.reject('error fetching');
			}
	})});

  const importHTML = jest.fn().mockImplementation((url, { fetch }) => {
		return {
			getExternalScripts: () => rawGetExternalScripts(['http://kuitos.me/error.js'], fetch),
			getExternalStyleSheets: () => rawGetExternalStyleSheets(['http://kuitos.me/error.css'], fetch),
		};
	});

  const { getExternalScripts, getExternalStyleSheets } = await importHTML('http://kuitos.me', { fetch });

  // TODO
  await expect(getExternalStyleSheets()).rejects.toMatch('error fetching');

  done();
});
