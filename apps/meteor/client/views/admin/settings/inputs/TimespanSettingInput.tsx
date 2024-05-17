import { Field, FieldLabel, FieldRow, InputBox, Select } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { FormEventHandler, ReactElement } from 'react';
import React, { useMemo, useState } from 'react';

import ResetSettingButton from '../ResetSettingButton';
import type { SettingInputProps } from './types';

type TimespanSettingInputProps = SettingInputProps<string, string | number> & {
	value: string;
};

export enum TIMEUNIT {
	days = 'days',
	hours = 'hours',
	minutes = 'minutes',
}

export const timeUnitToMs = (unit: TIMEUNIT, timespan: number) => {
	switch (unit) {
		case TIMEUNIT.days:
			return timespan * 24 * 60 * 60 * 1000;

		case TIMEUNIT.hours:
			return timespan * 60 * 60 * 1000;

		case TIMEUNIT.minutes:
			return timespan * 60 * 1000;

		default:
			throw new Error('TimespanSettingInput - timeUnitToMs - invalid time unit');
	}
};

export const msToTimeUnit = (unit: TIMEUNIT, timespan: number) => {
	switch (unit) {
		case TIMEUNIT.days:
			return timespan / 24 / 60 / 60 / 1000;
		case TIMEUNIT.hours:
			return timespan / 60 / 60 / 1000;
		case TIMEUNIT.minutes:
			return timespan / 60 / 1000;
		default:
			throw new Error('TimespanSettingInput - msToTimeUnit - invalid time unit');
	}
};

export const getHighestTimeUnit = (value: number): TIMEUNIT => {
	const minutes = msToTimeUnit(TIMEUNIT.minutes, value);
	if (minutes % 60 !== 0) {
		return TIMEUNIT.minutes;
	}

	const hours = msToTimeUnit(TIMEUNIT.hours, value);
	if (hours % 24 !== 0) {
		return TIMEUNIT.hours;
	}

	return TIMEUNIT.days;
};

const sanitizeInputValue = (value: number) => {
	if (!value) {
		return 0;
	}

	const sanitizedValue = Math.max(0, value).toFixed(0);

	return Number(sanitizedValue);
};

function TimespanSettingInput({
	_id,
	label,
	value,
	placeholder,
	readonly,
	autocomplete,
	disabled,
	required,
	onChangeValue,
	hasResetButton,
	onResetButtonClick,
	packageValue,
}: TimespanSettingInputProps): ReactElement {
	const t = useTranslation();

	const [timeUnit, setTimeUnit] = useState<TIMEUNIT>(getHighestTimeUnit(Number(value)));
	const [internalValue, setInternalValue] = useState<number>(msToTimeUnit(timeUnit, Number(value)));

	const handleChange: FormEventHandler<HTMLInputElement> = (event) => {
		const newValue = sanitizeInputValue(Number(event.currentTarget.value));

		onChangeValue?.(timeUnitToMs(timeUnit, newValue));

		setInternalValue(newValue);
	};

	const handleChangeTimeUnit = (nextTimeUnit: string | number) => {
		if (typeof nextTimeUnit !== 'string') {
			return;
		}
		setTimeUnit((prevTimeUnit) => {
			setInternalValue((currentValue) => {
				const newValue = sanitizeInputValue(msToTimeUnit(nextTimeUnit as TIMEUNIT, timeUnitToMs(prevTimeUnit, currentValue)));

				// Update the external value since the new internal value could have changed during sanitization
				onChangeValue?.(timeUnitToMs(nextTimeUnit as TIMEUNIT, newValue));

				return newValue;
			});

			return nextTimeUnit as TIMEUNIT;
		});
	};

	const timeUnitOptions = useMemo(() => {
		return Object.entries(TIMEUNIT).map<readonly [TIMEUNIT, string]>(([label, value]) => [value, t.has(label) ? t(label) : label]); // todo translate
	}, [t]);

	const handleResetButtonClick = () => {
		onResetButtonClick?.();
		const newTimeUnit = getHighestTimeUnit(Number(packageValue));
		setTimeUnit(newTimeUnit);
		setInternalValue(msToTimeUnit(newTimeUnit, Number(packageValue)));
	};

	return (
		<Field>
			<FieldRow>
				<FieldLabel htmlFor={_id} title={_id} required={required}>
					{label}
				</FieldLabel>
				{hasResetButton && <ResetSettingButton data-qa-reset-setting-id={_id} onClick={handleResetButtonClick} />}
			</FieldRow>
			<FieldRow>
				<InputBox
					data-qa-setting-id={_id}
					id={_id}
					type='number'
					value={internalValue}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readonly}
					autoComplete={autocomplete === false ? 'off' : undefined}
					onChange={handleChange}
				/>
			</FieldRow>
			<FieldRow>
				<Select value={timeUnit} disabled={disabled} options={timeUnitOptions} onChange={handleChangeTimeUnit} />
			</FieldRow>
		</Field>
	);
}

export default TimespanSettingInput;
