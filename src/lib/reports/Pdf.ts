const fs = require('fs');
import hbs = require('handlebars');
import puppeteer = require('puppeteer');
import path = require('path');
import { BusinessError } from '../common/business-error';

hbs.registerHelper('greaterThan', function (v1, v2, options) {
    'use strict';
    if (v1 > v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

let browser;
export async function compileHandlebars(templateName: string, data: any) {
    console.log("BASE_DIRECTORY => ", process.cwd());
    const basedir = process.cwd();
    const filePath = path.join(basedir, 'templates', `${templateName}.hbs`);
    if (!filePath) {
        throw new BusinessError(`No se pudo encontrar la plantilla ${templateName}.hbs para el reporte PDF`, 400);
    }
    const html = fs.readFileSync(filePath, 'utf-8');
    return hbs.compile(html)(data);
}

export async function generatePDF(fileName: string, data: any) {
    if (!browser) {
        browser = await puppeteer.launch({
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage"
            ],
            headless: true
        });
    }
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    const content = await compileHandlebars(fileName, data);

    page.setDefaultNavigationTimeout(0);
    await page.goto(`data: text/html, ${content}`, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
    });
    await page.setContent(content);
    await page.waitFor(1000);

    const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `
        <div style="border-top: solid 1px #bbb; width: 100%; font-size: 9px;
            padding: 5px 5px 0; color: #bbb; position: relative;">
            <div style="position: absolute; right: 5px; top: 5px;">Página&nbsp;<span class="pageNumber"></span>&nbsp;de&nbsp;<span class="totalPages"></span></div>
        </div>`,
        margin: { left: "1cm", right: "1cm", bottom: '1cm' }
    });

    await context.close();
    return pdf;
}