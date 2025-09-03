'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type PartOfSpeech =
  | 'imenica'
  | 'glagol'
  | 'pridev'
  | 'prilog'
  | 'zamenica'
  | 'predlog'
  | 'veznik'
  | 'ostalo';

type CaseSet = {
  nominativ: boolean;
  genitiv: boolean;
  dativ: boolean;
  akuzativ: boolean;
};

type Props = {
  filterTip: PartOfSpeech | '';
  setFilterTip: (v: PartOfSpeech | '') => void;

  caseSet: CaseSet;
  setCaseSet: (next: CaseSet) => void;

  colorByArticle: boolean;
  setColorByArticle: (v: boolean) => void;
};

export default function LessonFilters({
  filterTip,
  setFilterTip,
  caseSet,
  setCaseSet,
  colorByArticle,
  setColorByArticle,
}: Props) {
  const someCase =
    caseSet.nominativ ||
    caseSet.genitiv ||
    caseSet.dativ ||
    caseSet.akuzativ;

  const toggleCase = (key: keyof CaseSet) =>
    setCaseSet({ ...caseSet, [key]: !caseSet[key] });

  const toggleAllCases = (checked: boolean) =>
    setCaseSet({
      nominativ: checked,
      genitiv: checked,
      dativ: checked,
      akuzativ: checked,
    });

  const resetAll = () => {
    setFilterTip('');
    setCaseSet({
      nominativ: false,
      genitiv: false,
      dativ: false,
      akuzativ: false,
    });
    setColorByArticle(false);
  };

  const showReset = Boolean(filterTip || someCase || colorByArticle);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 p-3 border rounded-md bg-gray-50">
      <div className="flex items-center gap-2">
        <Label className="text-sm">Tip reči</Label>
        <Select
          value={filterTip || 'all'}
          onValueChange={(v) =>
            setFilterTip(v === 'all' ? '' : (v as PartOfSpeech))
          }
        >
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Sve" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Sve</SelectItem>
            <SelectItem value="imenica">Imenica</SelectItem>
            <SelectItem value="glagol">Glagol</SelectItem>
            <SelectItem value="pridev">Pridev</SelectItem>
            <SelectItem value="prilog">Prilog</SelectItem>
            <SelectItem value="zamenica">Zamenica</SelectItem>
            <SelectItem value="predlog">Predlog</SelectItem>
            <SelectItem value="veznik">Veznik</SelectItem>
            <SelectItem value="ostalo">Ostalo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Label className="text-sm">Padeži</Label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={caseSet.nominativ}
            onCheckedChange={() => toggleCase('nominativ')}
          />
          <span className="text-sm">Nominativ</span>
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={caseSet.genitiv}
            onCheckedChange={() => toggleCase('genitiv')}
          />
          <span className="text-sm">Genitiv</span>
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={caseSet.dativ}
            onCheckedChange={() => toggleCase('dativ')}
          />
          <span className="text-sm">Dativ</span>
        </label>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={caseSet.akuzativ}
            onCheckedChange={() => toggleCase('akuzativ')}
          />
          <span className="text-sm">Akuzativ</span>
        </label>

        <div className="flex items-center gap-2 pl-2">
          <Checkbox
            checked={someCase}
            onCheckedChange={(c) => toggleAllCases(Boolean(c))}
          />
          <span className="text-sm text-muted-foreground">Svi</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={colorByArticle}
          onCheckedChange={setColorByArticle}
          id="article-colors"
        />
        <Label htmlFor="article-colors" className="text-sm">
          Bojenje po članu (der/die/das)
        </Label>
      </div>

      {showReset && (
        <Button variant="outline" size="sm" onClick={resetAll}>
          Resetuj filtere
        </Button>
      )}
    </div>
  );
}
