/**
 * XML Parser usage examples
 */
import { buildXML, parseXML } from "./xml.parser";

const xmlSource = `
  <root>
    <item id="1">value1</item>
    <item id="2">value2</item>
  </root>
`;

console.log("--- XML Parser ---");
const xmlResult = parseXML(xmlSource);

if (xmlResult._tag === "Success") {
	console.log("XML AST:", JSON.stringify(xmlResult.value.ast, null, 2));
} else {
	console.error("XML Parsing Error:", xmlResult.value);
}

console.log("\n--- XML Builder ---");
const objToBuild = { root: { item: [{ "@_id": "1", "#text": "value1" }, { "@_id": "2", "#text": "value2" }] } };
const builtXml = buildXML(objToBuild);
console.log("Built XML:", builtXml);
