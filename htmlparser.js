class AnahtarTag {
    constructor(tagName, startPos, endPos = null, attributes = {}) {
        this.name = tagName;
        this.startPosition = startPos;
        this.endPosition = endPos;
        this.attributes = {}; // {"name": value}
    }
}


class AnahtarTagParser {
    // for flawless html only; no validations
    // non-paired tags declaration ends with "/>"
    constructor() {
        this.tagDeclarationOpener = "<";
        this.tagDeclarationCloser = ">";
        this.closingTagMarker = "/";
        this.attributeValueEncloser = '"';
        this.specialDeclarationChars = " =" + this.tagDeclarationCloser + this.closingTagMarker + this.attributeValueEncloser;
    }

    parseText(aText) {
        let i = 0;
        let tags = []; //this is goingto be a list of anahtarTags objects
        let plainText = "";
        let openedTags = []; //array of unclosed tags
        let tagHolder = null;
        let tagDeclarationsLength = 0;
        let inTagDeclaration = false;
        let tagName = "";
        let closingTag = false;
        let tagNameConcluded = false;
        let positionHolder = 0;
        let singleTag = false;
        let attrName = "";
        let attrValue = "";
        let inAttrValueDeclaration = false;
        let attributes = {};

        const resetVars = () => {
            inTagDeclaration = false;
            tagName = "";
            closingTag = false;
            tagNameConcluded = false;
            singleTag = false;
            attrName = "";
            attrValue = "";
            inAttrValueDeclaration = false;
            attributes = {};
        }

        for (i = 0; i < aText.length; i++) {
            if (!inTagDeclaration) {
                if (aText[i] == this.tagDeclarationOpener) {
                    inTagDeclaration = true;
                    positionHolder = i - tagDeclarationsLength;
                    tagName = "";
                    tagDeclarationsLength++;
                } else {
                    plainText += aText[i];
                }
            } else {
                tagDeclarationsLength++;
                if (!this.specialDeclarationChars.includes(aText[i])) {
                    if (!tagNameConcluded) {
                        tagName += aText[i];
                    } else if (inAttrValueDeclaration) {
                        attrValue += aText[i];
                    } else {
                        attrName += aText[i];
                    }
                } else {
                    if (!tagNameConcluded) {
                        tagNameConcluded = true;
                    }
                    switch (aText[i]) {
                        case this.closingTagMarker: {
                            if (tagName.length == 0) {
                                closingTag = true;
                            } else {
                                singleTag = true;
                            }
                            break;
                        }

                        case this.tagDeclarationCloser: {
                            if (closingTag) {
                                tagHolder = openedTags.pop();
                                tagHolder.endPosition = positionHolder;
                                tags.push(tagHolder);
                            } else {
                                tagHolder = new AnahtarTag();
                                tagHolder.startPosition = positionHolder;
                                tagHolder.name = tagName;
                                tagHolder.attributes = attributes;
                                if (singleTag) {
                                    tagHolder.endPosition = positionHolder;
                                    tags.push(tagHolder);
                                } else {
                                    openedTags.push(tagHolder);
                                }
                            }

                            resetVars();
                            break;
                        }

                        case this.attributeValueEncloser: {
                            if (!inAttrValueDeclaration) {
                                inAttrValueDeclaration = true;
                            } else {
                                attributes[attrName] = attrValue;
                                inAttrValueDeclaration = false;
                                attrName = "";
                                attrValue = "";
                            }
                            break;
                        }

                        default: {
                            tagNameConcluded = true;
                            break;
                        }
                    }
                }
            }
        }

        return {
            "tags": tags,
            "plainText": plainText
        };

    }
}

