import { BasePicker } from './BasePicker';
import { DateFormatterFn, PickerDayRenderType, PickerLocale, DaysStateTypes } from './types';
interface RangePickerOptions {
    locale: PickerLocale;
    date?: string;
    dateFormatter?: DateFormatterFn;
    weekOffset?: number;
    dayRenderType?: PickerDayRenderType;
    datePickerAutoRow?: boolean;
    datePickerMaxRow?: number;
    delayTimeout?: number;
    twoSide?: boolean;
    normalized?: boolean;
    endDate?: string;
}
declare class RangePicker extends BasePicker {
    private _selectedEndDate?;
    private _hoveredDate?;
    constructor(props: RangePickerOptions);
    changeDay: (date: string, state: DaysStateTypes) => void;
    isSelectedDay: (date: string) => boolean;
    getSelectedEndDate: () => string | undefined;
    getSelecteEndDateUnformated: () => string | undefined;
    private _updateChangeDay;
    getEndDate: () => string;
    goToToday: () => void;
    onCellHover: (date: string) => void;
    isDateInRange: (date: string, includeStart?: boolean, includeEnd?: boolean) => boolean;
    isSelecting: () => boolean;
    isStartDate: (date: string) => boolean;
    isEndDate: (date: string) => boolean;
    setRenderedDate: (date: string) => void;
    setEndDate: (date: string) => void;
}
export { RangePicker };
