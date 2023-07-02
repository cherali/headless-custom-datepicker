import { BasePicker } from './BasePicker';
import { DateFormatterFn, PickerDayRenderType, PickerLocale, DaysStateTypes } from './types';
interface DatePickerOptions {
    locale: PickerLocale;
    date?: string;
    dateFormatter?: DateFormatterFn;
    weekOffset?: number;
    dayRenderType?: PickerDayRenderType;
    datePickerAutoRow?: boolean;
    datePickerMaxRow?: number;
    delayTimeout?: number;
    twoSide?: boolean;
}
declare class DatePicker extends BasePicker {
    constructor(props: DatePickerOptions);
    changeDay: (date: string, state: DaysStateTypes) => void;
    isSelectedDay: (date: string) => boolean;
    private _updateChangeDay;
}
export { DatePicker };
