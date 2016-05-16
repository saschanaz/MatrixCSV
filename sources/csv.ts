﻿module MatrixCSV {
    interface CSVLine {
        line: string;
        nextPosition: number;
    }
    export function readFile(file: Blob, delimiter = ',') {
        return new Promise<Matrix<string>>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev: Event) => {
                resolve(MatrixCSV.decode(<string>(<FileReader>ev.target).result, delimiter));
            };
            reader.readAsText(file);
        });
    }
    export function decode(text: string, delimiter = ',') {
        const matrix = new Matrix<string>();
        let currentPosition = 0;
        let linePosition = 1;
        while (currentPosition < text.length) {
            const  lineObject = readLine(text, currentPosition);
            if (!lineObject) {
                break;
            }
            currentPosition = lineObject.nextPosition;
            
            let splitted: string[];
            try {
                splitted = splitByDelimiter(lineObject.line, delimiter);//lineObject.line.split(delimiter);
            }
            catch (e) {
                throw new Error("CSV Error: Line " + linePosition + ", " + (<Error>e).message);
            }
            for (let i = 1; i <= splitted.length; i++) {
                matrix.set([linePosition, i], splitted[i - 1]);
            }
            linePosition++;
        }
        return matrix;
    }
    function readLine(str: string, startIndex: number) {
        const firstcut = str.slice(startIndex);
        const found = firstcut.search(/[\r\n]/);
        if (found != -1) {
            const length = firstcut.slice(found).match(/[\r\n]+/)[0].length;
            return { line: firstcut.slice(0, found), nextPosition: startIndex + found + length };
        }
        else
            return { line: firstcut, nextPosition: str.length };
    }
    function splitByDelimiter(str: string, delimiter: string) {
        let isInQuote = false;
        const items: string[] = [];
        let item = "";
        let mayQuoteEnd = false;//just met a quotation mark in a quote

        for (let i = 0; i < str.length; i++) {
            const char = str[i];

            //delimiter
            if (char === delimiter && !(isInQuote && !mayQuoteEnd)) {
                items.push(item);
                item = "";
                isInQuote = false;
                mayQuoteEnd = false;
                continue;
            }

            //quote escaping
            if (char === '"') {
                if (item.length == 0) {
                    isInQuote = true;
                    continue;
                }
                else if (isInQuote) {//already quoted
                    if (!mayQuoteEnd) {
                        mayQuoteEnd = true;
                        continue;
                    }
                    else {
                        mayQuoteEnd = false;
                    }
                }
            }
            else if (mayQuoteEnd) {
                throw new Error(`"column (${i + 1}): quote is incorrectly ended.`);
            }

            item += char;
        }

        items.push(item);
        return items;
    }

    export function encode(matrix: Matrix<any>) {
        let result = "";
        let line = 1;
        if (matrix.dimension != 2) {
            throw new Error("Matrix should be 2-dimensional to be saved as CSV.");
        }
        matrix.forEach((item, coordinate) => {
            if (coordinate[0] != line) {
                result += "\r\n";
                line++;
            }
            else if (coordinate[1] != 1) {
                result += ',';
            }

            if (item === undefined) {
                return;
            }
            item = "" + item;
            if ((<string>item).match(/[,\"]/)) {
                result += escape(item);
            }
            else {
                result += item;
            }
        });
        return result;
    }
    function escape(input: string) {
        return '"' + input.replace(/\"/g, '""') + '"';
    }
}