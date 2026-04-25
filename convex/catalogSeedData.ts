export type SeedDistillery = {
  name: string;
  region: string;
  country: string;
  source: string;
};

export type SeedBottle = {
  name: string;
  distillery: string;
  category: string;
  region: string;
  age?: number;
  abv?: number;
  notes?: string;
  source: string;
};

// Hand-curated starter catalog based on public distillery/product pages and
// Wikipedia region/distillery facts. We store only short factual metadata that
// is practical for autocomplete/testing, not tasting-note copy or label images.
export const scotchDistilleries: SeedDistillery[] = [
  { name: "Ardbeg", region: "Islay", country: "Scotland", source: "https://www.ardbeg.com/" },
  { name: "Lagavulin", region: "Islay", country: "Scotland", source: "https://www.malts.com/en-row/products/lagavulin/" },
  { name: "Laphroaig", region: "Islay", country: "Scotland", source: "https://www.laphroaig.com/" },
  { name: "Bowmore", region: "Islay", country: "Scotland", source: "https://www.bowmore.com/" },
  { name: "Bruichladdich", region: "Islay", country: "Scotland", source: "https://www.bruichladdich.com/" },
  { name: "Bunnahabhain", region: "Islay", country: "Scotland", source: "https://bunnahabhain.com/" },
  { name: "Caol Ila", region: "Islay", country: "Scotland", source: "https://www.malts.com/en-row/products/caol-ila/" },
  { name: "Kilchoman", region: "Islay", country: "Scotland", source: "https://www.kilchomandistillery.com/" },
  { name: "Highland Park", region: "Islands", country: "Scotland", source: "https://www.highlandparkwhisky.com/" },
  { name: "Talisker", region: "Islands", country: "Scotland", source: "https://www.malts.com/en-row/products/talisker/" },
  { name: "Arran", region: "Islands", country: "Scotland", source: "https://www.arranwhisky.com/" },
  { name: "Tobermory", region: "Islands", country: "Scotland", source: "https://tobermorydistillery.com/" },
  { name: "Springbank", region: "Campbeltown", country: "Scotland", source: "https://www.springbank.scot/" },
  { name: "Glen Scotia", region: "Campbeltown", country: "Scotland", source: "https://www.glenscotia.com/" },
  { name: "Glenfiddich", region: "Speyside", country: "Scotland", source: "https://www.glenfiddich.com/" },
  { name: "The Balvenie", region: "Speyside", country: "Scotland", source: "https://www.thebalvenie.com/" },
  { name: "Macallan", region: "Speyside", country: "Scotland", source: "https://www.themacallan.com/" },
  { name: "Aberlour", region: "Speyside", country: "Scotland", source: "https://www.aberlour.com/" },
  { name: "Glenlivet", region: "Speyside", country: "Scotland", source: "https://www.theglenlivet.com/" },
  { name: "GlenAllachie", region: "Speyside", country: "Scotland", source: "https://glenallachie.com/" },
  { name: "Craigellachie", region: "Speyside", country: "Scotland", source: "https://www.craigellachie.com/" },
  { name: "Benromach", region: "Speyside", country: "Scotland", source: "https://www.benromach.com/" },
  { name: "Mortlach", region: "Speyside", country: "Scotland", source: "https://www.malts.com/en-row/products/mortlach/" },
  { name: "GlenDronach", region: "Highlands", country: "Scotland", source: "https://www.glendronachdistillery.com/" },
  { name: "Glenmorangie", region: "Highlands", country: "Scotland", source: "https://www.glenmorangie.com/" },
  { name: "Clynelish", region: "Highlands", country: "Scotland", source: "https://www.malts.com/en-row/products/clynelish/" },
  { name: "Oban", region: "Highlands", country: "Scotland", source: "https://www.malts.com/en-row/products/oban/" },
  { name: "Deanston", region: "Highlands", country: "Scotland", source: "https://deanstonmalt.com/" },
  { name: "Old Pulteney", region: "Highlands", country: "Scotland", source: "https://www.oldpulteney.com/" },
  { name: "Loch Lomond", region: "Highlands", country: "Scotland", source: "https://www.lochlomondwhiskies.com/" },
  { name: "Edradour", region: "Highlands", country: "Scotland", source: "https://edradour.com/" },
  { name: "Blair Athol", region: "Highlands", country: "Scotland", source: "https://www.malts.com/en-row/products/blair-athol/" },
  { name: "Glengoyne", region: "Highlands", country: "Scotland", source: "https://www.glengoyne.com/" },
  { name: "Auchentoshan", region: "Lowlands", country: "Scotland", source: "https://www.auchentoshan.com/" },
  { name: "Glenkinchie", region: "Lowlands", country: "Scotland", source: "https://www.malts.com/en-row/products/glenkinchie/" },
  { name: "Bladnoch", region: "Lowlands", country: "Scotland", source: "https://bladnoch.com/" }
];

export const scotchBottles: SeedBottle[] = [
  { name: "Ardbeg 10 Year Old", distillery: "Ardbeg", category: "Single Malt", region: "Islay", age: 10, abv: 46, notes: "Core release", source: "https://www.ardbeg.com/" },
  { name: "Ardbeg Uigeadail", distillery: "Ardbeg", category: "Single Malt", region: "Islay", abv: 54.2, notes: "NAS", source: "https://www.ardbeg.com/" },
  { name: "Lagavulin 16 Year Old", distillery: "Lagavulin", category: "Single Malt", region: "Islay", age: 16, abv: 43, notes: "Core release", source: "https://www.malts.com/en-row/products/lagavulin/" },
  { name: "Lagavulin 8 Year Old", distillery: "Lagavulin", category: "Single Malt", region: "Islay", age: 8, abv: 48, notes: "Core release", source: "https://www.malts.com/en-row/products/lagavulin/" },
  { name: "Laphroaig 10 Year Old", distillery: "Laphroaig", category: "Single Malt", region: "Islay", age: 10, abv: 40, notes: "Core release", source: "https://www.laphroaig.com/" },
  { name: "Laphroaig Quarter Cask", distillery: "Laphroaig", category: "Single Malt", region: "Islay", abv: 48, notes: "NAS", source: "https://www.laphroaig.com/" },
  { name: "Bowmore 12 Year Old", distillery: "Bowmore", category: "Single Malt", region: "Islay", age: 12, abv: 40, notes: "Core release", source: "https://www.bowmore.com/" },
  { name: "Bowmore 15 Year Old", distillery: "Bowmore", category: "Single Malt", region: "Islay", age: 15, abv: 43, notes: "Core release", source: "https://www.bowmore.com/" },
  { name: "Bruichladdich The Classic Laddie", distillery: "Bruichladdich", category: "Single Malt", region: "Islay", abv: 50, notes: "NAS", source: "https://www.bruichladdich.com/" },
  { name: "Port Charlotte 10 Year Old", distillery: "Bruichladdich", category: "Single Malt", region: "Islay", age: 10, abv: 50, notes: "Heavily peated", source: "https://www.bruichladdich.com/" },
  { name: "Bunnahabhain 12 Year Old", distillery: "Bunnahabhain", category: "Single Malt", region: "Islay", age: 12, abv: 46.3, notes: "Core release", source: "https://bunnahabhain.com/" },
  { name: "Caol Ila 12 Year Old", distillery: "Caol Ila", category: "Single Malt", region: "Islay", age: 12, abv: 43, notes: "Core release", source: "https://www.malts.com/en-row/products/caol-ila/" },
  { name: "Kilchoman Machir Bay", distillery: "Kilchoman", category: "Single Malt", region: "Islay", abv: 46, notes: "NAS", source: "https://www.kilchomandistillery.com/" },
  { name: "Kilchoman Sanaig", distillery: "Kilchoman", category: "Single Malt", region: "Islay", abv: 46, notes: "NAS", source: "https://www.kilchomandistillery.com/" },
  { name: "Highland Park 12 Year Old", distillery: "Highland Park", category: "Single Malt", region: "Islands", age: 12, abv: 40, notes: "Core release", source: "https://www.highlandparkwhisky.com/" },
  { name: "Highland Park Cask Strength", distillery: "Highland Park", category: "Single Malt", region: "Islands", abv: 63.3, notes: "Batch-strength release", source: "https://www.highlandparkwhisky.com/" },
  { name: "Talisker 10 Year Old", distillery: "Talisker", category: "Single Malt", region: "Islands", age: 10, abv: 45.8, notes: "Core release", source: "https://www.malts.com/en-row/products/talisker/" },
  { name: "Talisker Storm", distillery: "Talisker", category: "Single Malt", region: "Islands", abv: 45.8, notes: "NAS", source: "https://www.malts.com/en-row/products/talisker/" },
  { name: "Arran 10 Year Old", distillery: "Arran", category: "Single Malt", region: "Islands", age: 10, abv: 46, notes: "Core release", source: "https://www.arranwhisky.com/" },
  { name: "Arran Sherry Cask The Bodega", distillery: "Arran", category: "Single Malt", region: "Islands", abv: 55.8, notes: "NAS", source: "https://www.arranwhisky.com/" },
  { name: "Tobermory 12 Year Old", distillery: "Tobermory", category: "Single Malt", region: "Islands", age: 12, abv: 46.3, notes: "Core release", source: "https://tobermorydistillery.com/" },
  { name: "Ledaig 10 Year Old", distillery: "Tobermory", category: "Single Malt", region: "Islands", age: 10, abv: 46.3, notes: "Peated line", source: "https://tobermorydistillery.com/" },
  { name: "Springbank 10 Year Old", distillery: "Springbank", category: "Single Malt", region: "Campbeltown", age: 10, abv: 46, notes: "Core release", source: "https://www.springbank.scot/" },
  { name: "Springbank 15 Year Old", distillery: "Springbank", category: "Single Malt", region: "Campbeltown", age: 15, abv: 46, notes: "Core release", source: "https://www.springbank.scot/" },
  { name: "Glen Scotia Double Cask", distillery: "Glen Scotia", category: "Single Malt", region: "Campbeltown", abv: 46, notes: "NAS", source: "https://www.glenscotia.com/" },
  { name: "Glen Scotia 15 Year Old", distillery: "Glen Scotia", category: "Single Malt", region: "Campbeltown", age: 15, abv: 46, notes: "Core release", source: "https://www.glenscotia.com/" },
  { name: "Glenfiddich 12 Year Old", distillery: "Glenfiddich", category: "Single Malt", region: "Speyside", age: 12, abv: 40, notes: "Core release", source: "https://www.glenfiddich.com/" },
  { name: "Glenfiddich 15 Year Old Solera", distillery: "Glenfiddich", category: "Single Malt", region: "Speyside", age: 15, abv: 40, notes: "Solera vat", source: "https://www.glenfiddich.com/" },
  { name: "The Balvenie DoubleWood 12 Year Old", distillery: "The Balvenie", category: "Single Malt", region: "Speyside", age: 12, abv: 40, notes: "Core release", source: "https://www.thebalvenie.com/" },
  { name: "The Balvenie Caribbean Cask 14 Year Old", distillery: "The Balvenie", category: "Single Malt", region: "Speyside", age: 14, abv: 43, notes: "Rum cask finish", source: "https://www.thebalvenie.com/" },
  { name: "Macallan 12 Year Old Double Cask", distillery: "Macallan", category: "Single Malt", region: "Speyside", age: 12, abv: 40, notes: "Core release", source: "https://www.themacallan.com/" },
  { name: "Macallan 15 Year Old Double Cask", distillery: "Macallan", category: "Single Malt", region: "Speyside", age: 15, abv: 43, notes: "Core release", source: "https://www.themacallan.com/" },
  { name: "Aberlour 12 Year Old", distillery: "Aberlour", category: "Single Malt", region: "Speyside", age: 12, abv: 40, notes: "Core release", source: "https://www.aberlour.com/" },
  { name: "Aberlour A'bunadh", distillery: "Aberlour", category: "Single Malt", region: "Speyside", abv: 61.2, notes: "Batch-strength sherry cask", source: "https://www.aberlour.com/" },
  { name: "The Glenlivet 12 Year Old", distillery: "Glenlivet", category: "Single Malt", region: "Speyside", age: 12, abv: 40, notes: "Core release", source: "https://www.theglenlivet.com/" },
  { name: "The Glenlivet 15 Year Old French Oak Reserve", distillery: "Glenlivet", category: "Single Malt", region: "Speyside", age: 15, abv: 40, notes: "French oak finish", source: "https://www.theglenlivet.com/" },
  { name: "GlenAllachie 12 Year Old", distillery: "GlenAllachie", category: "Single Malt", region: "Speyside", age: 12, abv: 46, notes: "Core release", source: "https://glenallachie.com/" },
  { name: "GlenAllachie 15 Year Old", distillery: "GlenAllachie", category: "Single Malt", region: "Speyside", age: 15, abv: 46, notes: "Core release", source: "https://glenallachie.com/" },
  { name: "Craigellachie 13 Year Old", distillery: "Craigellachie", category: "Single Malt", region: "Speyside", age: 13, abv: 46, notes: "Core release", source: "https://www.craigellachie.com/" },
  { name: "Benromach 10 Year Old", distillery: "Benromach", category: "Single Malt", region: "Speyside", age: 10, abv: 43, notes: "Core release", source: "https://www.benromach.com/" },
  { name: "Mortlach 12 Year Old", distillery: "Mortlach", category: "Single Malt", region: "Speyside", age: 12, abv: 43.4, notes: "Core release", source: "https://www.malts.com/en-row/products/mortlach/" },
  { name: "GlenDronach 12 Year Old", distillery: "GlenDronach", category: "Single Malt", region: "Highlands", age: 12, abv: 43, notes: "Core release", source: "https://www.glendronachdistillery.com/" },
  { name: "GlenDronach 15 Year Old Revival", distillery: "GlenDronach", category: "Single Malt", region: "Highlands", age: 15, abv: 46, notes: "Core release", source: "https://www.glendronachdistillery.com/" },
  { name: "Glenmorangie Original 12 Year Old", distillery: "Glenmorangie", category: "Single Malt", region: "Highlands", age: 12, abv: 40, notes: "Core release", source: "https://www.glenmorangie.com/" },
  { name: "Glenmorangie Quinta Ruban 14 Year Old", distillery: "Glenmorangie", category: "Single Malt", region: "Highlands", age: 14, abv: 46, notes: "Port cask finish", source: "https://www.glenmorangie.com/" },
  { name: "Clynelish 14 Year Old", distillery: "Clynelish", category: "Single Malt", region: "Highlands", age: 14, abv: 46, notes: "Core release", source: "https://www.malts.com/en-row/products/clynelish/" },
  { name: "Oban 14 Year Old", distillery: "Oban", category: "Single Malt", region: "Highlands", age: 14, abv: 43, notes: "Core release", source: "https://www.malts.com/en-row/products/oban/" },
  { name: "Deanston Virgin Oak", distillery: "Deanston", category: "Single Malt", region: "Highlands", abv: 46.3, notes: "NAS", source: "https://deanstonmalt.com/" },
  { name: "Deanston 12 Year Old", distillery: "Deanston", category: "Single Malt", region: "Highlands", age: 12, abv: 46.3, notes: "Core release", source: "https://deanstonmalt.com/" },
  { name: "Old Pulteney 12 Year Old", distillery: "Old Pulteney", category: "Single Malt", region: "Highlands", age: 12, abv: 40, notes: "Core release", source: "https://www.oldpulteney.com/" },
  { name: "Loch Lomond 12 Year Old", distillery: "Loch Lomond", category: "Single Malt", region: "Highlands", age: 12, abv: 46, notes: "Core release", source: "https://www.lochlomondwhiskies.com/" },
  { name: "Edradour 10 Year Old", distillery: "Edradour", category: "Single Malt", region: "Highlands", age: 10, abv: 40, notes: "Core release", source: "https://edradour.com/" },
  { name: "Blair Athol 12 Year Old", distillery: "Blair Athol", category: "Single Malt", region: "Highlands", age: 12, abv: 43, notes: "Distillery bottling", source: "https://www.malts.com/en-row/products/blair-athol/" },
  { name: "Glengoyne 12 Year Old", distillery: "Glengoyne", category: "Single Malt", region: "Highlands", age: 12, abv: 43, notes: "Core release", source: "https://www.glengoyne.com/" },
  { name: "Auchentoshan Three Wood", distillery: "Auchentoshan", category: "Single Malt", region: "Lowlands", abv: 43, notes: "NAS", source: "https://www.auchentoshan.com/" },
  { name: "Auchentoshan 12 Year Old", distillery: "Auchentoshan", category: "Single Malt", region: "Lowlands", age: 12, abv: 40, notes: "Core release", source: "https://www.auchentoshan.com/" },
  { name: "Glenkinchie 12 Year Old", distillery: "Glenkinchie", category: "Single Malt", region: "Lowlands", age: 12, abv: 43, notes: "Core release", source: "https://www.malts.com/en-row/products/glenkinchie/" },
  { name: "Bladnoch Vinaya", distillery: "Bladnoch", category: "Single Malt", region: "Lowlands", abv: 46.7, notes: "NAS", source: "https://bladnoch.com/" }
];
