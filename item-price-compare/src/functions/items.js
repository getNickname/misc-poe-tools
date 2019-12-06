import { fetchJSON } from "./http";
import { itemsApi } from "./config";

const meta = () => {
  return {
    fragments: {
      url_path: "getFragmentoverview",
      name_key: "currencyTypeName",
      compare_key: "chaosEquivalent",
    },
    prophecies: {
      url_path: "GetProphecyOverview",
      name_key: "name",
      compare_key: "chaosValue",
    },
    accessories: {
      url_path: "GetUniqueAccessoryOverview",
      name_key: "name",
      compare_key: "chaosValue",
    },
    divination_cards: {
      url_path: "GetDivinationCardsOverview",
      name_key: "name",
      compare_key: "chaosValue",
    },
    currencies: {
      url_path: "GetCurrencyOverview",
      name_key: "currencyTypeName",
      compare_key: "chaosEquivalent",
    },
    base_types: {
      url_path: "GetBaseTypeOverview",
      name_key: "detailsId",
      compare_key: "chaosValue",
    },
    maps: {
      url_path: "GetMapOverview",
      name_key: "name",
      compare_key: "chaosValue",
    },
  };
};

export const fetchItems = league => {
  const items = {};
  items[league] = {};

  return Promise.all(
    Object.entries(meta()).map(([type, details]) => {
      const url = itemsApi(details.url_path, league);
      console.log(`Fetching ${type} items for ${league} league from ${url}`);
      return fetchJSON(url)
        .then(itemsForLeague => {
          console.log(`Fetched: ${itemsForLeague.lines.length} ${type} items`);
          items[league][type] = itemsForLeague.lines;
        })
        .catch(error => {
          console.error(`Couldn't fetch items: ${error}`);
        });
    })
  ).then(() => {
    return items;
  });
};

const find = (items, league, name) => {
  let foundItem;
  for (const [type, details] of Object.entries(meta())) {
    for (const item of items[league][type]) {
      if (item[details.name_key] === name) {
        foundItem = item;
        foundItem.type = type;
        break;
      }
    }
    if (foundItem !== undefined) {
      break;
    }
  }

  return foundItem;
};

export const cost = (items, league, names) => {
  const foundItems = names.map(name => {
    return find(items, league, name);
  });

  if (foundItems.some(item => item === undefined)) return null;

  let value = 0;

  for (const item of foundItems) {
    const compareKey = meta()[item.type].compare_key;
    value += item[compareKey];
  }

  return Math.round(value);
};

export const comparePrice = (items, league, baseNames, compareNames) => {
  const baseItems = baseNames.map(baseName => {
    return find(items, league, baseName);
  });
  const compareItems = compareNames.map(compareName => {
    return find(items, league, compareName);
  });

  if (
    baseItems.some(item => item === undefined) ||
    compareItems.some(item => item === undefined)
  )
    return null;

  let value = 0;

  for (const baseItem of baseItems) {
    const baseItemCompareKey = meta()[baseItem.type].compare_key;
    value += baseItem[baseItemCompareKey];
  }

  for (const compareItem of compareItems) {
    const compareItemCompareKey = meta()[compareItem.type].compare_key;
    value -= compareItem[compareItemCompareKey];
  }

  return Math.round(value);
};
