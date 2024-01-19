import useClockStore from "../stores/clockStore";
import getFlagEmoji from "../utils/getFlagEmoji";

function TimezoneListComponent() {
    const groupedTimezones = new Map();
    const groupedPropertyName = "continentName"
    const timezoneList = useClockStore((state) => state.timezoneList);


    function groupedByTimezones(map, property) {
        timezoneList.forEach((timezoneItem) => {
            const propertyInItem = timezoneItem[property];
            if (!map.has(propertyInItem)) {
                map.set(propertyInItem, []);
            }

            timezoneItem["countryFlag"] = getFlagEmoji(timezoneItem.countryCode)
            map.get(propertyInItem).push(timezoneItem);
        });
    }


    groupedByTimezones(groupedTimezones, groupedPropertyName)

    return (
        <>
            {/* List grouped timezones using Map */}
            <h3>Timezones divided by {groupedPropertyName}</h3>
            <div>
                {[...groupedTimezones.entries()].map(([groupedProperty, timezones]) => (
                    <div key={groupedProperty}>
                        <h3>{groupedProperty}</h3>
                        <ul>
                            {timezones.map((timezoneItem) => (
                                <li style={{ "listStyle": "none", "textAlign": "left" }} key={timezoneItem.name}>{timezoneItem.name} <span>— {timezoneItem.currentTimeOffsetInMinutes}</span> <span>— {timezoneItem.countryFlag}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </>
    );
}

export default TimezoneListComponent;