'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                onClick={() => fileInputRef.current?.click()}
                className={`
          relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed 
          ${value ? 'border-transparent' : 'border-[var(--border-light)] hover:border-[var(--color-primary-500)]'}
          flex items-center justify-center cursor-pointer transition-all bg-[var(--bg-secondary)]
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                        <svg className="animate-spin h-8 w-8 text-[var(--color-primary-500)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : null}

                {value ? (
                    <div className="relative w-full h-full group">
                        <Image
                            src={value}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                        {!disabled && !isLoading && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Change</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-[var(--text-tertiary)]">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">Upload</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
                disabled={disabled || isLoading}
            />

            {value && !disabled && !isLoading && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove();
                    }}
                    className="text-xs text-[var(--color-error-500)] hover:underline"
                >
                    Remove photo
                </button>
            )}
        </div>
    );
}
