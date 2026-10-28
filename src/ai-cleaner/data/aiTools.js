export const AI_TOOLS = {
    improve: [
        {
            id: "repair-walls",
            command: "REPAIR_WALLS",
            icon: "🧱",
            label: "Բարելավել պատերը",
            description: "Վերականգնել վնասված, ճաքած կամ մաշված պատը",
        },
        {
            id: "beautify-house",
            command: "BEAUTIFY_HOUSE",
            icon: "🏠",
            label: "Գեղեցկացնել տունը",
            description: "Բարելավել տան ընդհանուր տեսքը",
        },
        {
            id: "make-pretty",
            command: "MAKE_PRETTY",
            icon: "✨",
            label: "Սիրունցնել",
            description: "Ավելի վառ, մաքուր և գրավիչ լուսանկար",
        },
        {
            id: "improve-lighting",
            command: "IMPROVE_LIGHTING",
            icon: "💡",
            label: "Բարելավել լուսավորությունը",
            description: "Բացել մութ նկարը, պահել գույքը",
        },
        {
            id: "add-tablecloth",
            command: "ADD_TABLECLOTH",
            icon: "🍽️",
            label: "Սեղան սփռոցով",
            description: "Սեղանին դնել մաքուր սփռոց",
        },
    ],

    removeGroups: [
        {
            id: "small-items",
            title: "Մանր ավելորդ իրեր",
            subtitle: "Հագուստ, կոշիկ, կոսմետիկա, շիշ և այլ ապրանքներ",
            tools: [
                {
                    id: "remove-clutter",
                    command: "REMOVE_CLUTTER",
                    icon: "🧹",
                    label: "Հանել մանր ավելորդ իրերը",
                    description:
                        "Շոր, կոշիկ, կոսմետիկա, շիշ, աղբ և այլ մանր ապրանքներ՝ մեկ սեղմումով",
                },
            ],
        },
        {
            id: "house-property",
            title: "Տան գույք",
            subtitle: "Յուրաքանչյուր գույք՝ առանձին կոճակ",
            tools: [
                {
                    id: "remove-chairs",
                    command: "REMOVE_CHAIRS",
                    icon: "🪑",
                    label: "Հեռացնել աթոռները",
                    description: "Միայն աթոռներն ու բազկաթոռները",
                },
                {
                    id: "remove-tables",
                    command: "REMOVE_TABLES",
                    icon: "🪵",
                    label: "Հեռացնել սեղանները",
                    description: "Ճաշասեղան կամ սուրճի սեղան",
                },
                {
                    id: "remove-sofas",
                    command: "REMOVE_SOFAS",
                    icon: "🛋️",
                    label: "Հեռացնել բազմոցները",
                    description: "Բազմոց և մեծ նստարան",
                },
                {
                    id: "remove-beds",
                    command: "REMOVE_BEDS",
                    icon: "🛏️",
                    label: "Հեռացնել մահճակալները",
                    description: "Մահճակալը նկարից",
                },
                {
                    id: "remove-people",
                    command: "REMOVE_PEOPLE",
                    icon: "👤",
                    label: "Հեռացնել մարդկանց",
                    description: "Մարդիկ նկարում",
                },
            ],
        },
    ],
};

export const ALL_AI_TOOLS = [
    ...AI_TOOLS.improve,
    ...AI_TOOLS.removeGroups.flatMap((group) => group.tools),
];
