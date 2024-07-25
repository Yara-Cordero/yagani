import { createPlaywrightRouter } from 'crawlee';
import {selectors} from "playwright";

export const router = createPlaywrightRouter();

const rowselector = 'tbody > tr';
const headselector = 'thead > tr > th';

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
    log.info(`enqueueing new URLs`);
    await enqueueLinks({
        globs: ['https://www.formula1.com/en/results/**'],
        label: 'detail',
    });
});

router.addHandler('detail', async ({ request, page, log, pushData }) => {
    const title = await page.title();

   const headerData = await page.$$eval(headselector, headers => {
       return headers.map(header => header.innerText.trim());
   })

   const tableData = await page.$$eval(rowselector, (rows, headers) => {
       return rows.map(row => {
           const cells = row.querySelectorAll('td');
           const cellData = Array.from(cells).map(cell => cell.innerText.trim())
           const rowData = {};
           headers.forEach((col, index) => {
               rowData[col] = cellData[index] || '';
           });
           return rowData;
       });
   }, headerData) ;





    log.info(`${title}`, { url: request.loadedUrl });
    await pushData({
        url: request.loadedUrl,
        title,
        tableData
    });
});
